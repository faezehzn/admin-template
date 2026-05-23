"use client";

import { useSession } from "next-auth/react";
import { hasPermission, Permission } from "@/lib/permissions";
import { ReactNode } from "react";

export default function Can({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;

  if (!hasPermission(role, permission)) {
    return null;
  }

  return children;
}
