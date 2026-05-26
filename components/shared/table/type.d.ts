import React, { ReactNode } from "react";

type AccessorFn<T> = (row: T) => React.ReactNode;

export type SortDir = "asc" | "desc";

type Column<T> = {
  header: string;
  accessor: keyof T | AccessorFn<T>;
  sortable?: boolean;
  sortKey?: string;
  cellClassName?: string;
  widthClassName?: string;
  hideOnMobile?: boolean;
};

type Action<T> = {
  label: string | ReactNode;
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  actions?: Action<T>[];
  className?: string;
  sortBy?: string;
  sortDir?: SortDir;
  onSortChange?: (sortBy: string, sortDir: SortDir) => void;
}
