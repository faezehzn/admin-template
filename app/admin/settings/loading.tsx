import { Skeleton } from "@/components/shared/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsLoading() {
  return (
    <div className="space-y-3 md:space-y-6 w-full text-primary-700">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <Tabs defaultValue="general" className="w-full pb-4">
        <TabsList>
          <TabsTrigger value="general" disabled>
            <Skeleton className="h-6 w-28" />
          </TabsTrigger>
          <TabsTrigger value="security" disabled>
            <Skeleton className="h-6 w-28" />
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            <Skeleton className="h-6 w-28" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-72 max-w-full" />
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full max-w-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full max-w-md" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
