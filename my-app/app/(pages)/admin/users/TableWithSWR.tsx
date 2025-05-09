"use client";
import { Column, TableBody } from "@/components/table/table-body";
import { TablePagination } from "@/components/table/table-pagination";
import TableSearch from "@/components/table/table-search";
import { useLanguage } from "@/hooks/language-context";
import { createUser, updateUserRoles } from "@/lib/actions/user.actions";
import { DomainUser, Role, SettingUsersResponse, UserWithRoles } from "@/types/user";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR from "swr";
import { NewUserSheet } from "./new-user-sheet";
import { UserEdit } from "./user-edit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TableWithSWRProps {
  fallbackData?: SettingUsersResponse;
  defaultPage: number;
  defaultLimit: number;
  defaultQuery: string;
  roles: Role[];
  domainUsers: DomainUser[];
}

const fetcher = (url: string) =>
  fetch(url).then<SettingUsersResponse>((res) => res.json());

export default function TableWithSWR({
  fallbackData,
  defaultPage,
  defaultLimit,
  defaultQuery,
  roles,
  domainUsers,
}: TableWithSWRProps) {
  const { t, language } = useLanguage();
  const i18n = t.users.table;

  // Initialize page and limit state from query string with defaults.
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(defaultPage)
  );
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(defaultLimit)
  );

  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(defaultQuery)
  );
  const skip = (page - 1) * limit;

  const swrKey = `${API_BASE_URL}/setting/users/?skip=${skip}&limit=${limit}&query=${encodeURIComponent(
    query
  )}`;

  const { data, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: fallbackData ?? undefined,
    keepPreviousData: true,
    revalidateOnMount: false, // Prevent duplicate fetch on mount
    revalidateOnFocus: false, // Optionally disable revalidation on focus
    revalidateOnReconnect: false, // Optionally disable revalidation on reconnect
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);
  const limitOptions = [5, 10, 20, 30];

  const handleUpdateUser = async (
    userId: number,
    active: boolean,
    activeChanged: boolean,
    addedRoles: number[],
    removedRoles: number[]
  ) => {
    try {
      await updateUserRoles({
        userId,
        active,
        activeChanged,
        addedRoles,
        removedRoles,
      });
      mutate();
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const handleCreateUser = async (
    id: number,
    username: string,
    fullname: string,
    title: string,
    roles: number[],
    active: boolean
  ) => {
    try {
      await createUser({
        id,
        username,
        fullname,
        title,
        roles,
        active,
      });
      mutate();
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const generateColumns = useMemo(() => {
    const baseColumns: Column<UserWithRoles>[] = [
      { header: "ID", accessor: "id" },
      { header: i18n.username, accessor: "username" },
      { header: i18n.fullname, accessor: "fullname" },
      { header: i18n.title, accessor: "title" },
    ];

    const roleKeys = data?.data?.[0]
      ? Object.keys(
          language === "ar" ? data.data[0].ar_roles : data.data[0].roles
        )
      : [];

    const roleColumns: Column<UserWithRoles>[] = roleKeys.map((roleKey) => ({
      header: roleKey,
      accessor: (row: UserWithRoles) =>
        language === "ar" ? row.ar_roles[roleKey] : row.roles[roleKey],
      render: (row: UserWithRoles) => {
        const isAssigned =
          language === "ar" ? row.ar_roles[roleKey] : row.roles[roleKey];
        return (
          <div className="flex items-center justify-center h-full">
            {isAssigned ? (
              <CircleCheckIcon className="text-green-600" />
            ) : (
              <CircleXIcon className="opacity-25" />
            )}
          </div>
        );
      },
    }));

    const activeColumn: Column<UserWithRoles> = {
      header: i18n.active,
      accessor: "active",
      render: (row: UserWithRoles) => (
        <div className="flex items-center justify-center h-full">
          {row.active ? (
            <CircleCheckIcon className="text-green-600" />
          ) : (
            <CircleXIcon className="opacity-25" />
          )}
        </div>
      ),
    };

    return [...baseColumns, ...roleColumns, activeColumn];
  }, [
    language,
    data?.data,
    i18n.active,
    i18n.fullname,
    i18n.title,
    i18n.username,
  ]);

  if (!data) return <div>{t.common.loading}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <TableSearch
            placeholder={i18n.search_place_holder}
            searchInput={query}
            onSearchInputChange={setQuery}
          />
        </div>
        <div className="flex-shrink-0">
          <NewUserSheet
            roles={roles}
            usersList={domainUsers}
            onSave={(user: {
              id: number;
              username: string;
              fullname: string;
              title: string;
              roles: number[];
              active: boolean;
            }) =>
              handleCreateUser(
                user.id,
                user.username,
                user.fullname,
                user.title,
                user.roles,
                user.active
              )
            }
          />
        </div>
      </div>

      <TableBody<UserWithRoles>
        columns={generateColumns}
        data={data.data}
        className="shadow-sm"
        options={(_: unknown, record: UserWithRoles) => (
          <UserEdit
            user={record}
            roles={roles}
            onSave={({
              userId,
              active,
              activeChanged,
              addedRoles,
              removedRoles,
            }: {
              userId: number;
              active: boolean;
              activeChanged: boolean;
              addedRoles: number[];
              removedRoles: number[];
            }) =>
              handleUpdateUser(
                userId,
                active,
                activeChanged,
                addedRoles,
                removedRoles
              )
            }
          />
        )}
      />

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        limit={limit}
        limitOptions={limitOptions}
        onLimitChange={(newLimit: number) => {
          setPage(1);
          setLimit(newLimit);
        }}
      />
    </div>
  );
}