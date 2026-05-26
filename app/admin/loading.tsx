import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 p-4">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-8 w-1/2" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 h-96 p-4">
          <Skeleton className="h-full w-full" />
        </Card>
        <Card className="md:col-span-3 h-96 p-4">
          <Skeleton className="h-full w-full" />
        </Card>
      </div>
    </div>
  );
}
