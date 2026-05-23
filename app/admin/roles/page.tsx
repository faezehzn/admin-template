"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PermissionsMatrix from "@/components/admin/permissions-matrix";
import Can from "@/components/auth/can";
import { TableMobile } from "@/components/shared/tableMobile";
import { CustomTable } from "@/components/shared/table";
import useMobileSize from "@/hooks/useMobileSize";
import { Action, Column } from "@/components/shared/table/type";
import { Role } from "@/types";
import { Tooltip } from "@/components/shared/tooltip";
import { cn } from "@/lib/utils";
import { DeleteBaseModal } from "@/components/modals/delete-base-modal";
import EditBaseDrawer from "@/components/admin/edit-base-drawer";
import { Input } from "@/components/ui/input";
import CreateBaseModal from "@/components/modals/create-base-modal";

const initialRoles = [
  { id: 1, name: "Admin", users: 3 },
  { id: 2, name: "Editor", users: 5 },
  { id: 3, name: "Viewer", users: 12 },
];

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const { isMobileSize } = useMobileSize();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editRoleData, setEditRoleData] = useState<Role>();
  const [deleteRole, setDeleteRole] = useState<Role | null>();

  const columns: Column<Role>[] = [
    {
      header: "name",
      accessor: "name",
      sortable: false,
    },
    {
      header: "users",
      accessor: "users",
      sortable: false,
    },
  ];

  const actions: Action<Role>[] = [
    {
      label: (
        <Can permission="roles.update">
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
        setEditRoleData(row);
      },
    },
    {
      label: (
        <Can permission="roles.delete">
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
        setDeleteRole(row);
      },
    },
  ];

  const handleDelete = () => {
    if (!deleteRole) return;

    setRoles((prev) => prev.filter((u) => u.id !== deleteRole.id));
    setDeleteRole(null);
  };

  return (
    <div className="space-y-3 md:space-y-6 w-full text-primary-700 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-diactive">Manage roles and permissions</p>
        </div>
        <Can permission="roles.create">
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Create Role
          </Button>
        </Can>
      </div>

      {/* Desktop/Mobile Table */}
      {isMobileSize ? (
        <TableMobile
          columns={columns}
          data={roles}
          isLoading={false}
          emptyText={"No users found."}
          actions={actions}
          className="pb-4"
        />
      ) : (
        <div className="pb-4">
          <CustomTable
            columns={columns}
            data={roles}
            isLoading={false}
            emptyText={"No users found."}
            actions={actions}
          />
        </div>
      )}

      <CreateBaseModal
        open={createOpen}
        setOpen={setCreateOpen}
        title="Create Role"
        description=""
        handler={() => {}}
        content={
          <>
            <Input placeholder="Role name" />
            <PermissionsMatrix />
          </>
        }
      />

      {editRoleData && (
        <EditBaseDrawer
          handler={() => {}}
          content={
            <Input placeholder="name" defaultValue={editRoleData.name} />
          }
          open={editOpen}
          title="Edit Role"
          setOpen={setEditOpen}
        />
      )}

      {/* Delete Dialog */}
      <DeleteBaseModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        handleDelete={handleDelete}
        title="Delete role?"
        description="This action cannot be undone. The role will be permanently removed."
      />
    </div>
  );
}
