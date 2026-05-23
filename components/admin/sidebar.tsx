"use client";

import { Dispatch, SetStateAction } from "react";
import { LayoutDashboard, Users, Shield, Settings, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROJECT_NAME } from "@/constants";

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const items = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Roles", href: "/admin/roles", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Profile", href: "/admin/profile", icon: User },
  ];

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
          open ? "translate-x-0 bg-background" : "-translate-x-full border-r border-primary-200",
        )}
      >
        <h1 className="text-xl font-bold">{PROJECT_NAME}</h1>

        <ul className="space-y-2">
          {items.map((item) => {
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
