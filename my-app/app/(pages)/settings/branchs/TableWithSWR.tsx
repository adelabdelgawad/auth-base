"use client";
import { Column, TableBody } from "@/components/table/table-body";
import { TablePagination } from "@/components/table/table-pagination";
import TableSearch from "@/components/table/table-search";
import { useLanguage } from "@/hooks/language-context";
import { createBranch, updateBranch, deleteBranch } from "@/lib/actions/branch.actions";
import { Branch } from "@/types";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { BranchesTableResponse } from "@/types/api";
import BranchEditSheet from "./branch-edit";
import NewBranchSheet from "./new-branch-sheet";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TableWithSWRProps {
  fallbackData?: BranchesTableResponse;
  defaultPage: number;
  defaultLimit: number;
  defaultQuery: string;
}

const fetcher = (url: string) =>
  fetch(url).then<BranchesTableResponse>((res) => res.json());

export default function BranchesTableWithSWR({
  fallbackData,
  defaultPage,
  defaultLimit,
  defaultQuery,
}: TableWithSWRProps) {
  const { t } = useLanguage();
  const i18n = t.branches?.table ?? {
    branch_name: "Branch Name",
    address: "Address",
    contact_info: "Contact Info",
    search_place_holder: "Search branches...",
    actions: "Actions",
  };

  // Query state for pagination and search
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

  const swrKey = `${API_BASE_URL}/branches/?skip=${skip}&limit=${limit}&query=${encodeURIComponent(
    query
  )}`;

  const { data, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: fallbackData ?? undefined,
    keepPreviousData: true,
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);
  const limitOptions = [5, 10, 20, 30];

  // CRUD handlers
  const handleCreateBranch = async (branch: Omit<Branch, "id" | "created_at" | "updated_at">) => {
    try {
      await createBranch(branch);
      mutate();
    } catch (err) {
      console.error("Error creating branch", err);
    }
  };

  const handleUpdateBranch = async (id: number, branch: Partial<Branch>) => {
    try {
      await updateBranch(id, branch);
      mutate();
    } catch (err) {
      console.error("Error updating branch", err);
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await deleteBranch(id);
      mutate();
    } catch (err) {
      console.error("Error deleting branch", err);
    }
  };

  // Table columns
  const columns: Column<Branch>[] = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { header: i18n.branch_name, accessor: "branch_name" },
      { header: i18n.address, accessor: "address" },
      { header: i18n.contact_info, accessor: "contact_info" },
      {
        header: i18n.actions ?? "Actions",
        accessor: "id",
        render: (row: Branch) => (
          <div className="flex gap-2">
            <BranchEditSheet
              branch={row}
              onSave={async (data) => handleUpdateBranch(row.id, data)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteBranch(row.id)}
              aria-label="Delete branch"
            >
              <TrashIcon className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [i18n]
  );

  if (!data) return <div>{t.common?.loading ?? "Loading..."}</div>;

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
          <NewBranchSheet onSave={handleCreateBranch} />
        </div>
      </div>

      <TableBody<Branch>
        columns={columns}
        data={data.data}
        className="shadow-sm"
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
