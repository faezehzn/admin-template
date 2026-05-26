import { Skeleton } from "@/components/shared/skeleton";

export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-8 w-full sm:w-32" />
      </div>

      {/* Search Bar Skeleton */}
      <Skeleton className="h-10 w-full sm:w-72" />

      {/* Table Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" /> {/* Header row */}
        <Skeleton className="h-16 w-full" /> {/* Data row 1 */}
        <Skeleton className="h-16 w-full" /> {/* Data row 2 */}
        <Skeleton className="h-16 w-full" /> {/* Data row 3 */}
      </div>
    </div>
  );
}
