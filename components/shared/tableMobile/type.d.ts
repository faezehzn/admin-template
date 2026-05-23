import React, { ReactNode } from "react";

type AccessorFn<T> = (row: T) => React.ReactNode;

type Column<T> = {
  header: string;
  accessor: keyof T | AccessorFn<T>;
  hideOnMobile?: boolean;
};

type Action<T> = {
  label: string | ReactNode;
  onClick: (row: T) => void;
  variant?: "primary" | "danger" | "ghost";
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  actions?: Action<T>[];
  className?: string;
}
