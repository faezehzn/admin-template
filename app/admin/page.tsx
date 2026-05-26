import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, ArrowUpRight, Users } from "lucide-react";
import { ReactNode } from "react";
import { getDashboardData } from "../actions/dashboard";
import { ActivityList } from "@/components/admin/dashboard/activity-list";
import { DashboardChart } from "@/components/admin/dashboard/dashboard-chart";
// import { getActivityLogs } from "../actions/logs";

export default async function DashboardPage() {
  const data = await getDashboardData();
  // const logActivites = await getActivityLogs();

  return (
    <div className="space-y-6 w-full text-primary-700">
      {/* Header & Quick Actions */}
      {/* <div className="flex flex-col sm:flex-row gap-5 items-center justify-between"> */}
      <div className="w-full text-start">
        <h1 className="text-3xl font-bold tracking-tight ">Dashboard</h1>
        <p className="text-diactive">Welcome back to your admin panel.</p>
      </div>
      {/* <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Download Report
          </Button>
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Add New
          </Button>
        </div> */}
      {/* </div> */}

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={<Users size={20} />}
          trend={data.newUsers.trend}
        />
        <StatCard
          title="Active Sessions"
          value={data.activeUsers.value}
          icon={<Activity size={20} />}
          trend={data.activeUsers.trend}
        />
        <StatCard
          title="Activation Rate"
          value={data.activationRate.value}
          icon={<ArrowUpRight size={20} />}
          trend={data.activationRate.trend}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Area Chart */}
        <Card className="md:col-span-4 ">
          <CardHeader>
            <CardTitle>Platform Visits</CardTitle>
          </CardHeader>
          <CardContent className="h-75 flex justify-center w-full">
            <DashboardChart data={data.chartData} />
          </CardContent>
        </Card>

        {/* Latest Activity (Simple List/Table) */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList users={data.recentUsers} />
            {/* <ActivityList users={logActivites.logs} /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: number;
}) {
  return (
    <Card className="flex flex-col gap-2 w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium capitalize">
          {title}
        </CardTitle>
        <div>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            "text-xs font-medium",
            trend > 0 ? "text-success" : "text-error",
          )}
        >
          {trend}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
