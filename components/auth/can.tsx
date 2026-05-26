"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

export default function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { data } = useSession();

  const permissions = data?.user?.permissions ?? [];

  if (!permissions.includes(permission)) {
    return null;
  }

  return children;
}
