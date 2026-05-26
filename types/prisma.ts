import type { Prisma } from "@prisma/client";

export type UserListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    avatar: true;
    status: true;
    roleId: true;
    createdAt: true;
    updatedAt: true;
    role: { select: { id: true; name: true } };
  };
}>;

export type RoleOption = Prisma.RoleGetPayload<{
  select: { id: true; name: true, users: true, permissions: true, level: true };
}>;
