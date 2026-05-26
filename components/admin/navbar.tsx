"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Router, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FaUser } from "react-icons/fa";
import { ThemeToggle } from "../shared/themeToggle";
import { useRouter } from "next/navigation";

export default function Navbar({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: sesstion } = useSession();
  const router = useRouter();
  return (
    <header className="border-b border-primary-100 flex items-center justify-between px-4 py-2 bg-light sticky z-30 w-full">
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg bg-primary-50 cursor-pointer"
      >
        <Menu size={18} />
      </button>

      {/* search box */}
      <div className="relative hidden md:block">
        <Search
          className="absolute left-1.5 top-1.5 z-1 text-primary-300"
          size={18}
        />
        <Input
          tooltipOn={false}
          placeholder="Search..."
          className="pl-8 w-72 bg-primary-50"
        />
      </div>

      {/* Right: Notifications & User Menu */}
      <div className="flex items-center gap-1">
        {/* dark/light mode btn */}
        <ThemeToggle className="px-1.5" />
        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 h-2 w-2 bg-error rounded-full" />
        </Button> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src={sesstion?.user.image || undefined} />
              <AvatarFallback>
                {sesstion?.user.name ? (
                  sesstion?.user.name.slice(0, 2)
                ) : (
                  <FaUser />
                )}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="p-0">
              <Button
                variant="ghost"
                className="w-full text-left justify-start"
                onClick={() => router.push("/admin/profile")}
              >
                Profile
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Button
                variant="ghost"
                className="w-full text-left justify-start"
                onClick={() => router.push("/admin/settings")}
              >
                Settings
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => signOut()} className="text-error">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
