"use client";

import { Dispatch, SetStateAction } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  User,
  LucideIcon,
  // [SIDEBAR_ITEM_ICON_IMPORT_MARKER]
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROJECT_NAME } from "@/constants";
import { useSession } from "next-auth/react";
import { Permission } from "@/prisma/seed";

export const sidebarItems: {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
}[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "users.read",
  },

  {
    name: "Roles",
    href: "/admin/roles",
    icon: Shield,
    permission: "roles.read",
  },
  // [SIDEBAR_ITEM_MARKER]

  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings.read",
  },

  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();

  const userPermissions = session?.user?.permissions ?? [];

  const filteredItems = sidebarItems.filter((item) => {
    /**
     * public item
     */
    if (!item.permission) {
      return true;
    }

    /**
     * protected item
     */
    return userPermissions.includes(item.permission);
  });

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/70 md:hidden z-40"
        />
      )}

      <aside
        className={cn(
          "text-primary-600 w-64 min-w-44 p-4 fixed md:static space-y-4 inset-y-0 left-0 z-50 transform md:translate-x-0 transition-transform duration-200",
          open
            ? "translate-x-0 bg-background"
            : "-translate-x-full border-r border-primary-200",
        )}
      >
        <h1 className="text-xl font-bold">{PROJECT_NAME}</h1>

        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-primary-50"
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
