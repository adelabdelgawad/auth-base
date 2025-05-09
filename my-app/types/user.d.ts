export type Role = {
  id: number;
  name: string;
  ar_name: string;
  description: string;
  ar_description: string;
};

export type DomainUser = {
  id: number;
  fullname: string;
  username: string;
  title: string;
};


export type UserWithRoles = {
  id: number;
  username: string;
  fullname: string;
  title: string;
  roles: Record<string, boolean>;
  ar_roles: Record<string, boolean>;
  active: boolean;
};
export type SettingUsersResponse = {
    total: number;
    data: UserWithRoles[];
  };