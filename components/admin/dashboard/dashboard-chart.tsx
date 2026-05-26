"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardChart({
  data,
}: {
  data: {
    name: string;
    visits: number;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--primary-500)"
              stopOpacity={0.3}
            />
            <stop offset="95%" stopColor="var(--primary-200)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
        <XAxis
          label={{
            value: "Days",
            position: "insideBottom",
            offset: -2,
            style: {
              fill: "#666",
              fontSize: 12,
            },
          }}
          dataKey="name"
          fontSize={12}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          label={{
            value: "Visits",
            angle: -90,
            offset: 15,
            position: "insideLeft",
            style: {
              textAnchor: "middle",
              fill: "#666",
              fontSize: 14,
            },
          }}
          fontSize={12}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="visits"
          stroke="var(--primary-200)"
          fill="url(#colorVisits)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
