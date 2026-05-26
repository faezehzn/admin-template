"use client";
import { ReactNode } from "react";
import { Column, TableProps, SortDir } from "./type";
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
import { Button } from "@/components/ui/button";

export function CustomTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyText = "No data available",
  actions,
  className = "",

  // NEW: controlled sort (from API)
  sortBy,
  sortDir = "asc",
  onSortChange,
}: TableProps<T>) {
  const handleSort = (col: Column<T>) => {
    if (!onSortChange) return;

    const key = col.sortKey; 
    if (!col.sortable || !key) return;

    const nextDir: SortDir =
      sortBy === key ? (sortDir === "asc" ? "desc" : "asc") : "asc";

    onSortChange(key, nextDir);
  };

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

              const sortable = !!(col.sortable && col.sortKey && onSortChange);
              const isActiveSort = sortable && sortBy === col.sortKey;

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
              <TableHead className="p-3 text-center font-medium text-primary-700 uppercase tracking-wide" />
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
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
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  );
                })}

                {actions && actions.length > 0 && (
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-6 w-10" />
                      <Skeleton className="h-6 w-10" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (data.length === 0) ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)}
                className="p-6 text-center"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
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
                          btnClass += "bg-red-100 text-red-600 hover:bg-red-200";
                        } else {
                          btnClass +=
                            "bg-secondary-100 text-secondary-600 hover:bg-secondary-200";
                        }

                        return (
                          <Button
                            key={idx}
                            type="button"
                            variant={"ghost"}
                            disabled={action?.disabled?.(row) ?? false}
                            onClick={() => action.onClick(row)}
                            className={cn(btnClass, action.className)}
                          >
                            {action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
