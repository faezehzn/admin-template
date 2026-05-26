import { prisma } from "./prisma";

export function canManageUser({
  currentUserRoleLevel,
  targetUserRoleLevel,
}: {
  currentUserRoleLevel: number;
  targetUserRoleLevel: number;
}) {
  return currentUserRoleLevel > targetUserRoleLevel;
}

export async function findDuplicateRoleByPermissions({
  permissionIds,
  excludeRoleId,
}: {
  permissionIds: string[];
  excludeRoleId?: string;
}) {
  const roles = await prisma.role.findMany({
    where: {
      deletedAt: null,

      ...(excludeRoleId
        ? {
            NOT: {
              id: excludeRoleId,
            },
          }
        : {}),
    },

    include: {
      permissions: true,
    },
  });

  const normalized = [...permissionIds].sort().join(",");

  for (const role of roles) {
    const rolePermissions = role.permissions
      .map((p) => p.permissionId)
      .sort()
      .join(",");

    if (rolePermissions === normalized) {
      return role;
    }
  }

  return null;
}