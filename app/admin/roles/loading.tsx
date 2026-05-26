import { Skeleton } from "@/components/shared/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>

        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* table header */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24 ml-auto" />
        </div>

        {/* rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 p-2 border-b border-border last:border-b-0"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />

            <div className="flex justify-end gap-2">
              <Skeleton className="h-6 w-8 rounded-md" />
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
