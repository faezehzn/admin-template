import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/requirePermission";

// ***************** GET ALL PERMISSIONS ***************************
export async function GET() {
  const permission = await requirePermission("roles.read");

  if ("error" in permission) {
    return permission.error;
  }

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
