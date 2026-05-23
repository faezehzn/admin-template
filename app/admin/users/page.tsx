"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Can from "@/components/auth/can";
import { User } from "@/types";
import { DeleteBaseModal } from "@/components/modals/delete-base-modal";
import { Action, Column } from "@/components/shared/table/type";
import { Tooltip } from "@/components/shared/tooltip";
import { cn } from "@/lib/utils";
import { CustomTable } from "@/components/shared/table";
import { TableMobile } from "@/components/shared/tableMobile";
import useMobileSize from "@/hooks/useMobileSize";
import EditBaseDrawer from "@/components/admin/edit-base-drawer";
import CreateBaseModal from "@/components/modals/create-base-modal";

const initialUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    role: "Editor",
    status: "inactive",
  },
  {
    id: 3,
    name: "Michael Lee",
    email: "michadfgfdfcfhgfhfhfhel@example.com",
    role: "Viewer",
    status: "active",
  },
];

export default function UsersPage() {
  const { isMobileSize } = useMobileSize();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<User>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const columns: Column<User>[] = [
    {
      header: "name",
      accessor: (row) => {
        return (
          <Tooltip
            side={"bottom"}
            content={row.name}
            offOrOn={isMobileSize ? "off" : "on"}
            className={cn(" justify-center")}
          >
            <div className="flex items-center gap-2 ">
              <Avatar className="block h-8 w-8">
                <AvatarFallback className=" text-sm! lg:text-base!">
                  {row.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <span className="font-medium md:max-w-30 lg:max-w-52 xl:max-w-96 md:truncate">
                {row.name}
              </span>
            </div>
          </Tooltip>
        );
      },
      sortKey: "name",
      sortable: true,
    },
    {
      header: "email",
      accessor: (row) => {
        return (
          <Tooltip
            side={"bottom"}
            offOrOn={isMobileSize ? "off" : "on"}
            content={row.email}
            className={cn(" justify-center")}
          >
            <span className="break-all font-medium">{row.email}</span>
          </Tooltip>
        );
      },
      cellClassName: "md:max-w-36 lg:max-w-56 truncate",
      sortKey: "email",
      sortable: true,
    },

    {
      header: "role",
      accessor: "role",
      sortKey: "role",
      sortable: true,
    },
    {
      header: "status",
      accessor: (row) => (
        <Badge variant={row.status === "active" ? "default" : "outline"}>
          {row.status}
        </Badge>
      ),
      sortKey: "status",
      sortable: true,
    },
  ];

  const actions: Action<User>[] = [
    {
      label: (
        <Can permission="users.update">
          <Tooltip
            side={"bottom"}
            content={"Edit"}
            className={cn(" justify-center")}
          >
            <Pencil size={16} className="w-full" />
          </Tooltip>
        </Can>
      ),
      variant: "ghost",
      onClick: (row) => {
        setEditOpen(true);
        setEditUserData(row);
      },
    },
    {
      label: (
        <Can permission="users.delete">
          <Tooltip
            side={"bottom"}
            content={"Delete"}
            className={cn(" justify-center")}
          >
            <Trash2 size={16} className="w-full" />
          </Tooltip>
        </Can>
      ),
      variant: "danger",
      onClick: (row) => {
        setDeleteOpen(true);
        setDeleteUser(row);
      },
    },
  ];

  const handleDelete = () => {
    if (!deleteUser) return;

    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  return (
    <div className="space-y-3 md:space-y-6 w-full text-primary-700 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-diactive">Manage platform users</p>
        </div>

        <Can permission="users.create">
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Create User
          </Button>
        </Can>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 z-1 -translate-y-1/2 text-primary-300"
          size={18}
        />

        <Input
          tooltipOn={false}
          placeholder="Search users..."
          className="pl-9 w-full sm:w-72 bg-primary-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop/Mobile Table */}
      {isMobileSize ? (
        <TableMobile
          columns={columns}
          data={filteredUsers}
          isLoading={false}
          emptyText={"No users found."}
          actions={actions}
          className="pb-4"
        />
      ) : (
        <div className="pb-4">
          <CustomTable
            columns={columns}
            data={filteredUsers}
            isLoading={false}
            emptyText={"No users found."}
            actions={actions}
          />
        </div>
      )}

      {/* Create Modal */}
      <CreateBaseModal
        open={createOpen}
        setOpen={setCreateOpen}
        title="Create User"
        description="Create a new user by filling out the form below."
        handler={() => {}}
        content={
          <>
            <Input placeholder="Full name" />
            <Input placeholder="Email" />
            <Input placeholder="Role" />
          </>
        }
      />

      {/* Edit Drawer */}
      {editUserData && (
        <EditBaseDrawer
          handler={() => {}}
          content={
            <div className="flex flex-col gap-4 w-full">
              <Input placeholder="name" defaultValue={editUserData.name} />
              <Input placeholder="email" defaultValue={editUserData.email} />
              <Input placeholder="role" defaultValue={editUserData.role} />
            </div>
          }
          title="Edit User"
          open={editOpen}
          setOpen={setEditOpen}
        />
      )}

      {/* Delete Dialog */}
      <DeleteBaseModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        handleDelete={handleDelete}
        title="Delete user?"
        description="This action cannot be undone. The user will be permanently removed."
      />
    </div>
  );
}
