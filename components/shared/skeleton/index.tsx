"use client";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({
  className,
  width,
  height,
  circle,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-800",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
