"use server";
import { prisma } from "@/lib/prisma";
import { ActivityLogWithUser } from "@/types/activity-log";

export async function getActivityLogs(
  page: number = 1,
  pageSize: number = 10,
): Promise<{
  logs: ActivityLogWithUser[];
  totalLogs: number;
}> {
  const skip = (page - 1) * pageSize;

  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          status: true,
        },
      },
    },
    orderBy: { timestamp: "desc" },
    skip: skip,
    take: pageSize,
  });

  const totalLogs = await prisma.activityLog.count();

  return { logs, totalLogs };
}
