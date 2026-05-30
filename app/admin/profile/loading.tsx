import { Skeleton } from "@/components/shared/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-3 md:space-y-6 w-full">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-4 md:grid-cols-12 pb-4">
        {/* Left Column */}
        <Card className="md:col-span-4 h-fit">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <Skeleton className="h-24 w-24 rounded-full" />

            {/* Name */}
            <Skeleton className="h-6 w-32" />

            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            {/* Divider */}
            <Skeleton className="h-px w-full" />

            {/* Info */}
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="md:col-span-8 space-y-4">
          {/* General Information */}
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-28 w-full" />
              </div>

              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>

            <CardContent className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}

              <Skeleton className="h-10 w-44" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}