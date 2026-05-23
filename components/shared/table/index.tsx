"use client";
import { ReactNode, useMemo, useState } from "react";
import { Column, TableProps } from "./type";
import { Skeleton } from "../skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CustomTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyText = "No data available",
  actions,
  className = "",
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /** handle sorting */
  const handleSort = (col: Column<T>) => {
    const key =
      col.sortKey ?? (typeof col.accessor !== "function" ? col.accessor : null);

    if (!key) return;

    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /** sorted data */
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    if (data) {
      const sorted = [...data].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];

        // null/undefined handling
        if (va == null && vb == null) return 0;
        if (va == null) return sortDir === "asc" ? -1 : 1;
        if (vb == null) return sortDir === "asc" ? 1 : -1;

        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }

        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
      return sorted;
    } else {
      return [];
    }
  }, [data, sortKey, sortDir]);

  return (
    <div
      className={cn(
        `w-full rounded-lg border border-border hidden md:block overflow-hidden`,
        className,
      )}
    >
      <Table className="border-collapse min-w-100">
        <TableHeader>
          <TableRow className="border-b border-border bg-primary-100/50">
            {columns.map((col, i) => {
              const isHiddenMobile = col.hideOnMobile
                ? "hidden md:table-cell"
                : "";
              const key =
                col.sortKey ??
                (typeof col.accessor === "function"
                  ? undefined
                  : (col.accessor as keyof T));

              const sortable = col.sortable && key;
              const isActiveSort = sortable && sortKey === key;

              return (
                <TableHead
                  key={i}
                  className={cn(
                    `tracking-wide`,
                    isHiddenMobile,
                    col.widthClassName,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className="inline-flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span className="capitalize font-medium">
                        {col.header}
                      </span>
                      <span className="text-xs">
                        {isActiveSort ? (sortDir === "asc" ? "▲" : "▼") : "⇵"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}

            {actions && actions.length > 0 && (
              <TableHead className="p-3 text-center font-medium text-primary-700 uppercase tracking-wide"></TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* LOADING + SKELETON */}
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow className="align-middle" key={rowIndex}>
                {columns.map((col, colIndex) => {
                  const isHiddenMobile = col.hideOnMobile
                    ? "hidden md:table-cell"
                    : "";
                  return (
                    <TableCell
                      key={colIndex}
                      className={cn(isHiddenMobile, col.cellClassName)}
                    >
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                  );
                })}

                {actions && actions.length > 0 && (
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length + (actions && actions.length > 0 ? 1 : 0)
                }
                className="p-6 text-center"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, rowIndex) => {
              return (
                <TableRow key={`row-${rowIndex}`} className="last:border-0">
                  {columns.map((col, colIndex) => {
                    const isHiddenMobile = col.hideOnMobile
                      ? "hidden md:table-cell"
                      : "";
                    const value =
                      typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode);

                    return (
                      <TableCell
                        key={colIndex}
                        className={cn(isHiddenMobile, col.cellClassName)}
                      >
                        {value}
                      </TableCell>
                    );
                  })}

                  {/* ACTIONS */}
                  {actions && actions.length > 0 && (
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, idx) => {
                          let btnClass =
                            "inline-flex items-center justify-center p-1 rounded font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
                          if (action.variant === "primary") {
                            btnClass +=
                              "bg-primary-100 text-primary-600 hover:bg-primary-200";
                          } else if (action.variant === "danger") {
                            btnClass +=
                              "bg-red-100 text-red-600 hover:bg-red-200";
                          } else {
                            // ghost
                            btnClass +=
                              "bg-secondary-100 text-secondary-600 hover:bg-secondary-200";
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={action?.disabled?.(row) ?? false}
                              onClick={() => action.onClick(row)}
                              className={cn(btnClass, action.className)}
                            >
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
