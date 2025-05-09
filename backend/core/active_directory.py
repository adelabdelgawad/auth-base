import asyncio
import logging
import re
from typing import List, Optional

import bonsai
from bonsai import AuthenticationError, LDAPError, LDAPSearchScope

from config import Settings
from core.schema import DomainUser


logger = logging.getLogger(__name__)


class ActiveDirectoryService:
    # === Constants ===
    LDAP_ENABLED_USER_FILTER = "(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))"
    LDAP_USER_ATTRIBUTES = [
        "sAMAccountName",
        "displayName",
        "title",
        "mail",
    ]
    LDAP_PAGED_SEARCH_SIZE = 250

    def __init__(
        self, username: Optional[str] = None, password: Optional[str] = None
    ):
        # === Service Account Configuration ===
        self.OU_PARENT_BASE = Settings.OU_PARENT_BASE
        self.AD_SERVER = Settings.AD_SERVER
        self.AD_PORT = Settings.AD_PORT
        self.AD_BIND_USERNAME = Settings.AD_BIND_USERNAME
        self.AD_BIND_PASSWORD = Settings.AD_BIND_PASSWORD
        self.AD_BASE_DN = Settings.AD_BASE_DN
        self.AD_USE_TLS = Settings.AD_USE_TLS

        # Optional user credentials
        self.username = username if username else self.AD_BIND_USERNAME
        self.password = password if password else self.AD_BIND_PASSWORD

    @staticmethod
    def extract_cn_from_dn(dn: Optional[str]) -> Optional[str]:
        """Extracts the common name (CN) from a distinguished name (DN)."""
        if not dn:
            return None
        match = re.search(r"CN=([^,]+)", dn, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None

    def get_ldap_client(
        self,
        use_service_account: bool = True,
        username: Optional[str] = None,
        password: Optional[str] = None,
    ) -> bonsai.LDAPClient:
        """Creates and configures an LDAP client instance."""
        protocol = "ldaps" if self.AD_USE_TLS else "ldap"
        client = bonsai.LDAPClient(
            f"{protocol}://{self.AD_SERVER}:{self.AD_PORT}"
        )
        try:
            if self.AD_USE_TLS:
                client.set_tls_options(bonsai.TLS_DEMAND, bonsai.TLS_ALLOW)
                logger.info(
                    f"Configured LDAPS connection to {self.AD_SERVER}:{self.AD_PORT}"
                )
            else:
                logger.info(
                    f"Configured LDAP connection to {self.AD_SERVER}:{self.AD_PORT}"
                )

            if use_service_account:
                client.set_credentials(
                    "SIMPLE",
                    user=self.AD_BIND_USERNAME,
                    password=self.AD_BIND_PASSWORD,
                )
            elif username and password:
                client.set_credentials(
                    "SIMPLE", user=username, password=password
                )
            else:
                raise ValueError(
                    "Username and password must be provided for user bind."
                )

            return client
        except LDAPError as e:
            logger.error(f"Failed to configure LDAP client: {e}")
            raise

    async def _get_connected_ldap_client(self) -> bonsai.LDAPClient:
        """
        Try to connect using instance credentials first;
        if authentication fails, fall back to service account credentials.
        """
        # Try user credentials if provided
        if self.username and self.password:
            try:
                client = self.get_ldap_client(
                    use_service_account=False,
                    username=self.username,
                    password=self.password,
                )
                await client.connect(is_async=True, timeout=10)
                logger.info(
                    f"Connected with user credentials: {self.username}"
                )
                return client
            except AuthenticationError:
                logger.warning(
                    f"User authentication failed for '{self.username}', falling back to service account."
                )
            except Exception as e:
                logger.error(f"Unexpected error with user credentials: {e}")

        # Fallback to service account
        client = self.get_ldap_client(use_service_account=True)
        await client.connect(is_async=True, timeout=10)
        logger.info("Connected with service account credentials.")
        return client

    async def authenticate_user(self, username: str, password: str) -> bool:
        """Bind with user credentials to verify password only."""
        try:
            client = self.get_ldap_client(
                use_service_account=False, username=username, password=password
            )
            async with client.connect(is_async=True, timeout=10):
                logger.info(f"User '{username}' authenticated successfully.")
                return True
        except AuthenticationError:
            logger.warning(f"Authentication failed for user '{username}'.")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {e}")
            return False

    def _parse_ldap_entry_to_domain_user(
        self, entry: bonsai.LDAPEntry
    ) -> Optional[DomainUser]:
        """Parses an LDAP entry into a DomainUser object."""
        username_val = entry.get("sAMAccountName", [None])[0]
        if not username_val:
            logger.warning(
                f"Skipping entry without sAMAccountName: {entry.dn}"
            )
            return None

        fullname_val = entry.get("displayName", [None])[0]
        title_val = entry.get("title", [None])[0]
        raw_manager_dn = entry.get("manager", [None])[0]
        email_val = entry.get("mail", [None])[0]

        return DomainUser(
            id=0,
            username=username_val,
            fullname=fullname_val,
            title=title_val,
            email=email_val,
        )

    async def get_child_ous(self) -> List[str]:
        """Retrieves the distinguished names of the immediate child OUs under OU_PARENT_BASE."""
        client_ous = await self._get_connected_ldap_client()
        try:
            async with client_ous.connect(is_async=True) as conn:
                logger.debug(f"Searching for OUs under {self.OU_PARENT_BASE}")
                ou_results = await conn.search(
                    base=self.OU_PARENT_BASE,
                    scope=LDAPSearchScope.ONELEVEL,
                    filter_exp="(objectClass=organizationalUnit)",
                    attrlist=["distinguishedName"],
                    timeout=10,
                )
                ou_dns = [
                    entry.get("distinguishedName", [None])[0]
                    for entry in ou_results
                    if entry.get("distinguishedName", [None])[0]
                ]
                logger.info(
                    f"Found {len(ou_dns)} child OUs under {self.OU_PARENT_BASE}"
                )
                return ou_dns
        except LDAPError as e:
            logger.error(
                f"LDAP Error retrieving OUs from {self.OU_PARENT_BASE}: {e}"
            )
            return []
        except Exception as e:
            logger.error(f"Unexpected error retrieving OUs: {e}")
            return []

    async def search_ou_users(self, ou_dn: str) -> List[DomainUser]:
        """Searches the given OU for enabled users using paged search."""
        client_ou = await self._get_connected_ldap_client()
        users = []
        try:
            async with client_ou.connect(is_async=True) as conn:
                logger.debug(f"Starting paged search in OU: {ou_dn}")
                async_iterator = await conn.paged_search(
                    base=ou_dn,
                    scope=LDAPSearchScope.SUB,
                    filter_exp=self.LDAP_ENABLED_USER_FILTER,
                    attrlist=self.LDAP_USER_ATTRIBUTES,
                    page_size=self.LDAP_PAGED_SEARCH_SIZE,
                    timeout=30,
                )
                async for entry in async_iterator:
                    user = self._parse_ldap_entry_to_domain_user(entry)
                    if user:
                        users.append(user)
                logger.info(
                    f"Paged search in OU '{ou_dn}' completed, found {len(users)} user(s)."
                )
                return users
        except LDAPError as e:
            logger.error(f"LDAP Error searching OU {ou_dn}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error searching OU {ou_dn}: {e}")
            return []

    async def search_ad_users(self) -> List[DomainUser]:
        """
        Searches for all enabled users in all child OUs.
        Uses instance credentials if provided, otherwise falls back to service account.
        """
        all_users: List[DomainUser] = []
        client = await self._get_connected_ldap_client()
        try:
            async with client.connect(is_async=True) as conn:
                logger.info("Connected to AD for search.")
                logger.debug("Performing concurrent search across child OUs.")
                ou_dns = await self.get_child_ous()
                if not ou_dns:
                    logger.warning(
                        f"No child OUs found under {self.OU_PARENT_BASE}. Cannot perform broad search."
                    )
                    raise ValueError(
                        f"No OUs found under the specified parent: {self.OU_PARENT_BASE}"
                    )

                logger.info(
                    f"Concurrently searching for enabled users in {len(ou_dns)} OUs."
                )
                search_tasks = [
                    self.search_ou_users(ou_dn) for ou_dn in ou_dns
                ]
                results_per_ou = await asyncio.gather(
                    *search_tasks, return_exceptions=True
                )
                for result in results_per_ou:
                    if isinstance(result, Exception):
                        logger.error(
                            f"Error during concurrent OU search task: {result}"
                        )
                    elif isinstance(result, list):
                        all_users.extend(result)
                    else:
                        logger.warning(
                            f"Unexpected result type from search_ou_users: {type(result)}"
                        )

                if not all_users:
                    logger.warning(
                        "No enabled users found in any searched OU."
                    )
                else:
                    logger.info(
                        f"Concurrent search across OUs found a total of {len(all_users)} enabled users."
                    )

        except LDAPError as e:
            logger.error(f"LDAP error during user search: {e}")
            raise
        except ValueError as e:
            logger.error(f"Search configuration or value error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during user search: {e}")
            raise

        for idx, user in enumerate(all_users):
            user.id = idx

        return all_users

    async def get_user_info_if_authenticated(self) -> Optional[DomainUser]:
        """
        Authenticate with the instance credentials and return user info if successful.
        Returns None if authentication fails or user not found.
        """
        try:
            client = await self._get_connected_ldap_client()
            async with client.connect(is_async=True, timeout=10) as conn:
                # Search for the user entry by sAMAccountName
                filter_exp = (
                    f"(&(objectClass=user)(sAMAccountName={self.username}))"
                )
                results = await conn.search(
                    base=self.AD_BASE_DN,
                    scope=LDAPSearchScope.SUB,
                    filter_exp=filter_exp,
                    attrlist=self.LDAP_USER_ATTRIBUTES,
                    timeout=10,
                )
                if not results:
                    logger.warning(
                        f"User '{self.username}' authenticated but not found in directory."
                    )
                    return None
                return self._parse_ldap_entry_to_domain_user(results[0])
        except AuthenticationError:
            logger.warning(
                f"Authentication failed for user '{self.username}'."
            )
            return None
        except Exception as e:
            logger.error(
                f"Error retrieving user info for '{self.username}': {e}"
            )
            return None
