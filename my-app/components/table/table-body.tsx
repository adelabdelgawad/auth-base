// components/Table/table-body.tsx
import { useLanguage } from "@/hooks/language-context";
import * as React from "react";

export type Column<T> = {
  /** Column header title */
  header: string;
  /**
   * Defines how to access the cell value.
   * Can be a key of the data object or a custom accessor function.
   */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /**
   * Optional custom render function to override the default cell rendering.
   *
   * @param row - The current row data.
   * @returns A React node to render.
   */
  render?: (row: T) => React.ReactNode;
};

export interface TableBodyProps<T extends { id: string | number }> {
  /** Array of column definitions */
  columns: Column<T>[];
  /** Array of data objects to display */
  data: T[];
  /**
   * Optional render function to display extra options (e.g. edit/view buttons).
   * It receives the record's id and the full record.
   */
  options?: (id: T["id"], record: T) => React.ReactNode;
  /** Optional additional class names for the table */
  className?: string;
}

/**
 * A dynamic and reusable table component.
 *
 * Renders table headers and rows based on provided columns and data.
 * If an `options` render function is provided, an extra column will be appended,
 * and it will be rendered for each row using the record's `id`.
 *
 * @param props - Table props.
 * @returns A table displaying the data.
 */
export function TableBody<T extends { id: string | number }>({
  columns,
  data,
  options,
  className = "",
}: TableBodyProps<T>) {
    const { t } = useLanguage();
    // Use the table keys under "requests.table"
  const tableTranslations = t.table;
  
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full table-auto border-collapse ${className}`}>
        <thead>
          <tr className="border-b">
            {columns.map((col, colIndex) => (
              <th key={colIndex} className="p-2 text-center whitespace-nowrap">
                {col.header}
              </th>
            ))}
            {options && (
              <th className="p-2 text-center whitespace-nowrap">{tableTranslations.actions}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b">
              {columns.map((col, colIndex) => {
                const cellContent = col.render
                  ? col.render(row)
                  : typeof col.accessor === "function"
                  ? col.accessor(row)
                  : row[col.accessor];
                return (
                  <td key={colIndex} className="p-2 whitespace-nowrap text-center">
                    {cellContent as React.ReactNode}
                  </td>
                );
              })}
              {options && (
                <td className="p-2 whitespace-nowrap text-center">
                  {options(row.id, row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
