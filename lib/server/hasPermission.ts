import { prisma } from "@/lib/prisma";

export async function hasPermission({
  roleId,
  permission,
}: {
  roleId: string;
  permission: string;
}) {
  const exists = await prisma.rolePermission.findFirst({
    where: {
      roleId,

      permission: {
        name: permission,
      },

      role: {
        deletedAt: null,
      },
    },
  });

  return !!exists;
}