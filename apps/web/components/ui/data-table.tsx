"use client";

import { useState, useMemo } from "react";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string, direction: "asc" | "desc") => void;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  ariaLabel?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  sortField,
  sortDirection = "asc",
  onSort,
  emptyMessage = "Tidak ada data",
  onRowClick,
  ariaLabel,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: sortField || columns[0]?.key || "",
    direction: sortDirection,
  });

  const currentSort = sortField !== undefined ? { field: sortField, direction: sortDirection } : internalSort;

  const sortedData = useMemo(() => {
    if (!onSort && sortField === undefined && currentSort.field) {
      return [...data].sort((a, b) => {
        const aVal = a[currentSort.field];
        const bVal = b[currentSort.field];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), "id");
        return currentSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [data, currentSort.field, currentSort.direction, onSort, sortField]);

  const handleSort = (field: string) => {
    if (!onSort) {
      setInternalSort((prev) => ({
        field,
        direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      const newDir = currentSort.field === field && currentSort.direction === "asc" ? "desc" : "asc";
      onSort(field, newDir);
    }
  };

  return (
    <div className="overflow-x-auto" role="region" aria-label={ariaLabel || "Data table"}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ""} ${
                  col.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""
                }`}
                onClick={() => col.sortable && handleSort(col.key)}
                aria-sort={
                  col.sortable && currentSort.field === col.key
                    ? currentSort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && currentSort.field === col.key && (
                    <span aria-hidden="true">
                      {currentSort.direction === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={`${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""} transition-colors`}
                onClick={() => onRowClick?.(item)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(item); } } : undefined}
                role={onRowClick ? "button" : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${col.className || ""}`}>
                    {col.render ? col.render(item, index) : String(item[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
