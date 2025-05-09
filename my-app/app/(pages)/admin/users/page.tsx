import { getDomainUsers, getRoles, getUsers } from "@/lib/actions/user.actions";
import { Suspense } from "react";
import TableWithSWR from "./TableWithSWR";
import TableSkeleton from "@/components/table/table-skelton";


interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    query?: string;
  };
}

const parseParam = (
  defaultValue: number,
  param?: string | string[]
): number => {
  const value = Array.isArray(param) ? param[0] : param;
  return value ? parseInt(value, 10) : defaultValue;
};

export default async function Page({ searchParams }: PageProps) {
  const {
    page: pageParam,
    limit: limitParam,
    query: queryParam,
  } = searchParams;

  // These will now reflect the values from the URL if present.
  const page = parseParam(1, pageParam);
  const limit = parseParam(10, limitParam);
  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam || "";
  const skip = (page - 1) * limit;

  const [data, roles, domainUsers] = await Promise.all([
    getUsers(limit, query, skip),
    getRoles(),
    getDomainUsers(),
  ]);

  return (
    <div className="w-full p-2 pt-5">
      <Suspense fallback={<TableSkeleton />}>
        <TableWithSWR
          fallbackData={data}
          defaultPage={page}
          defaultLimit={limit}
          defaultQuery={query}
          roles={roles || []}
          domainUsers={domainUsers || []}
        />
      </Suspense>
    </div>
  );
}