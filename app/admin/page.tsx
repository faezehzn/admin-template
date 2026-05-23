"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, ArrowUpRight, DollarSign, Plus, Users } from "lucide-react";
import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Mon", visits: 400 },
  { name: "Tue", visits: 700 },
  { name: "Wed", visits: 500 },
  { name: "Thu", visits: 900 },
  { name: "Fri", visits: 600 },
  { name: "Sat", visits: 800 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 w-full text-primary-700">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="w-full text-start">
          <h1 className="text-3xl font-bold tracking-tight ">Dashboard</h1>
          <p>Welcome back to your admin panel.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Download Report
          </Button>
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Add New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,543"
          icon={<Users size={20} />}
          trend={+12}
        />
        <StatCard
          title="Revenue"
          value="$45,231"
          icon={<DollarSign size={20} />}
          trend={+8}
        />
        <StatCard
          title="Active Sessions"
          value="573"
          icon={<Activity size={20} />}
          trend={-5}
        />
        <StatCard
          title="Growth"
          value="24%"
          icon={<ArrowUpRight size={20} />}
          trend={+4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Area Chart */}
        <Card className="col-span-4 ">
          <CardHeader>
            <CardTitle>Platform Visits</CardTitle>
          </CardHeader>
          <CardContent className="h-75 flex justify-center w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary-500)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary-200)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ccc"
                  className="focus:outline-none bg-error"
                />
                <XAxis
                  dataKey="name"
                  // label={{
                  //   value: "Month",
                  //   position: "insideBottom",
                  //   offset: -5,
                  //   style: {
                  //     fill: "#666",
                  //     fontSize: 14,
                  //   },
                  // }}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  // label={{
                  //   value: "Visits",
                  //   angle: -90,
                  //   offset: 15,
                  //   position: "insideLeft",
                  //   style: {
                  //     textAnchor: "middle",
                  //     fill: "#666",
                  //     fontSize: 14,
                  //   },
                  // }}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="var(--primary-200)"
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latest Activity (Simple List/Table) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 h-75 px-1.5 overflow-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-primary-300 pb-3 last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-primary-300">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
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
  value: string;
  icon: ReactNode;
  trend: number;
}) {
  return (
    <Card className="flex flex-col gap-2 w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
