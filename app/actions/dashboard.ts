"use server";

import { prisma } from "@/lib/prisma";
import { subDays, format, isSameDay } from "date-fns";

export async function getDashboardData() {
  const sevenDaysAgo = subDays(new Date(), 7);
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1); // current month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); //last month

  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "asc" },
  });
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = subDays(new Date(), 6 - i);
    const count = recentUsers.filter((user) =>
      isSameDay(user.createdAt, day),
    ).length;
    return {
      name: format(day, "EEE"),
      visits: count,
    };
  });

  // ***************‌ user  ************************
  // user count - current month
  const currentMonthUsers = await prisma.user.count({
    where: { createdAt: { gte: startOfCurrentMonth } },
  });

  // user count - last month
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
    },
  });

  // trend of the user
  const userTrend =
    lastMonthUsers === 0
      ? 100
      : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

  // ***************‌ active user  ************************
  const currentActiveUsers = await prisma.user.count({
    where: { status: "active", createdAt: { gte: startOfCurrentMonth } },
  });
  const lastActiveUsers = await prisma.user.count({
    where: {
      status: "active",
      createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
    },
  });
  const activeUserTrend =
    lastActiveUsers === 0
      ? 100
      : ((currentActiveUsers - lastActiveUsers) / lastActiveUsers) * 100;

  // *********************** Activation Rate (Current month activation rate: ratio of active users to total users in the same month) *************
  // Activation Rate - current month
  const totalCurrentMonth = currentMonthUsers === 0 ? 1 : currentMonthUsers;
  const currentRate = (currentActiveUsers / totalCurrentMonth) * 100;

  // last month
  const totalLastMonth = lastMonthUsers === 0 ? 1 : lastMonthUsers;
  const lastRate = (lastActiveUsers / totalLastMonth) * 100;

  const rateTrend =
    lastRate === 0 ? 100 : ((currentRate - lastRate) / lastRate) * 100;

  return {
    recentUsers: await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        role: true,
      },
    }),
    totalUsers: await prisma.user.count(),

    chartData,
    newUsers: {
      value: currentMonthUsers,
      trend: parseFloat(userTrend.toFixed(1)),
    },
    activeUsers: {
      value: currentActiveUsers,
      trend: parseFloat(activeUserTrend.toFixed(1)),
    },
    activationRate: {
      value: parseFloat(currentRate.toFixed(1)),
      trend: parseFloat(rateTrend.toFixed(1)),
    },
  };
}
