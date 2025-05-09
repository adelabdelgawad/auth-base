// components/TableSearch.tsx
import React from "react";

interface TableSearchProps {
  placeholder: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

const TableSearch: React.FC<TableSearchProps> = ({
  placeholder,
  searchInput,
  onSearchInputChange,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="text"
        value={searchInput}
        placeholder={placeholder}
        onChange={(e) => onSearchInputChange(e.target.value)}
        className="border p-2 rounded w-64"
      />
    </div>
  );
};

export default TableSearch;
