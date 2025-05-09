import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/language-context";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  limitOptions: number[];
  onLimitChange: (limit: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  limitOptions,
  onLimitChange,
}: TablePaginationProps) {
  const { t } = useLanguage();
  const i18n = t.table;

  return (
    <div
      className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8"
      dir="ltr" // Force left-to-right layout regardless of global language
    >
      <div className="flex items-center text-muted-foreground text-sm whitespace-nowrap">
        {i18n.page} {currentPage} {i18n.of} {totalPages}
      </div>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {/* Limit Selector */}
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap font-medium text-sm">
            {i18n.records_per_page}
          </p>
          <Select
            value={`${limit}`}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[4.5rem] [&[data-size]]:h-8">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {limitOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Info */}
        <div className="flex items-center justify-center font-medium text-sm">
          {i18n.page} {currentPage} {i18n.of} {totalPages}
        </div>

        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
