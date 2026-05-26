"use client";

import { ReactNode } from "react";
import { Column, TableProps } from "./type";
import { Skeleton } from "../skeleton";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function TableMobile<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyText = "No data available",
  actions,
  className = "",
}: TableProps<T>) {
  const renderValue = (row: T, col: Column<T>) => {
    if (typeof col.accessor === "function") {
      return col.accessor(row);
    }
    return row[col.accessor] as ReactNode;
  };

  return (
    <div className={cn("w-full md:hidden", className)}>
      {/* ---------- LOADING ---------- */}
      {isLoading && (
        <div className="divide-y divide-border">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      )}

      {/* ---------- EMPTY ---------- */}
      {!isLoading && (!data || data.length === 0) && (
        <div className="p-6 text-center text-sm text-primary-500">
          {emptyText}
        </div>
      )}

      {/* ---------- DATA ---------- */}
      {!isLoading && data && data.length > 0 && (
        <Accordion type="single" collapsible className="space-y-3">
          {data.map((row) => {
            return (
              <AccordionItem
                key={row.id}
                value={String(row.id)}
                className="border border-border rounded-xl px-4"
              >
                {/* -------- HEADER -------- */}
                <AccordionTrigger
                  className="py-3"
                >
                  <div className="flex flex-col gap-1 sm:font-semibold text-sm">
                    <span className=" text-primary-600">
                      {renderValue(row, columns[0])}
                    </span>
                  </div>
                </AccordionTrigger>

                {/* -------- CONTENT -------- */}
                <AccordionContent className="pt-2 space-y-1">
                  {columns.slice(1).map((col, idx) => {
                    if (col.hideOnMobile) return null;

                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between text-sm gap-2 flex-wrap"
                      >
                        <span className="text-primary-500 whitespace-nowrap capitalize">
                          {col.header}:
                        </span>

                        <span className="text-primary-600 text-left wrap-break-word">
                          {renderValue(row, col)}
                        </span>
                      </div>
                    );
                  })}

                  {/* -------- ACTIONS -------- */}
                  {actions && actions.length > 0 && (
                    <div className="pt-2 flex gap-2 justify-end">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => action.onClick(row)}
                          className={cn(
                            "w-full inline-flex items-center justify-center text-sm py-1.5 px-2 rounded font-medium cursor-pointer transition-colors",
                            action.variant === "danger"
                              ? "bg-red-50 border border-red-200  text-red-600 hover:bg-red-100"
                              : action.variant === "ghost"
                                ? "bg-secondary-50 border border-secondary-200 text-secondary-600 hover:bg-secondary-100"
                                : "bg-primary-50 border border-primary-200 text-primary-600 hover:bg-primary-100",
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
