"use client";
import Sidebar from "@/components/admin/sidebar";
import Navbar from "@/components/admin/navbar";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar setOpen={setOpen} open={open} />

      {/* Main Content */}
      <div className="flex flex-col w-full justify-center items-center h-full">
        <Navbar setOpen={setOpen} />
        <main className="p-4 md:p-8 max-w-360 flex gap-4 w-full justify-center overflow-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
