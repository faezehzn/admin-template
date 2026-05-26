"use client";

import EditBaseDrawer from "@/components/admin/edit-base-drawer";
import PermissionsMatrix from "@/components/admin/permissions-matrix";
import Can from "@/components/auth/can";
import CreateBaseModal from "@/components/modals/create-base-modal";
import { DeleteBaseModal } from "@/components/modals/delete-base-modal";
import { CustomTable } from "@/components/shared/table";
import { Action, Column } from "@/components/shared/table/type";
import { TableMobile } from "@/components/shared/tableMobile";
import { Tooltip } from "@/components/shared/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useErrorToast, useSuccessToast } from "@/hooks/useCustomToasts";
import useMobileSize from "@/hooks/useMobileSize";
import { handleError } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";
import { CreateRoleInput, UpdateRoleInput } from "@/lib/validations/roles";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from "@/stores/rolesApi";
import { RoleOption } from "@/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const initialRole = { name: "", level: 1, permissions: [] };

export default function RolesComponent() {
  const { show: showError } = useErrorToast();
  const { show: showSuccess } = useSuccessToast();
  const { isMobileSize } = useMobileSize();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createRoleData, setCreateRoleData] = useState<{
    name: string;
    level: number;
    permissions: {
      permissionId: string;
    }[];
  }>(initialRole);
  const [editRoleData, setEditRoleData] = useState<RoleOption>();
  const [deleteRole, setDeleteRole] = useState<RoleOption | null>();

  /**
   * api
   */
  const { data, isLoading } = useGetRolesQuery();
  const [createRole, { isLoading: isLoadingCreate }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isLoadingUpdate }] = useUpdateRoleMutation();
  const [deleteRoleMutation, { isLoading: isLoadingDelete }] =
    useDeleteRoleMutation();

  const columns: Column<RoleOption>[] = [
    {
      header: "name",
      accessor: "name",
      sortable: false,
    },
    {
      header: "users",
      accessor: (row) => row.users.length,
      sortable: false,
    },
  ];

  const actions: Action<RoleOption>[] = [
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

  /**
   * create
   */
  const handleCreate = async () => {
    try {
      const payload: CreateRoleInput = {
        name: createRoleData?.name ?? "",
        level: createRoleData.level,
        permissions: createRoleData?.permissions ?? [],
      };

      await createRole(payload).unwrap();

      setCreateOpen(false);
      setCreateRoleData(initialRole);
      showSuccess("Role created successfully");
    } catch (error) {
      handleError({ showError, error });
    }
  };

  /**
   * update
   */
  const handleUpdate = async () => {
    if (!editRoleData) return;

    try {
      const payload: UpdateRoleInput = {
        id: editRoleData.id,
        name: editRoleData.name,
        level: editRoleData.level,
        permissions: editRoleData.permissions,
      };

      await updateRole(payload).unwrap();

      setEditOpen(false);
      showSuccess("The role updated successfully");
    } catch (error) {
      handleError({ showError, error });
    }
  };

  /**
   * delete
   */
  const handleDelete = async () => {
    if (!deleteRole) return;

    try {
      await deleteRoleMutation(deleteRole.id).unwrap();

      setDeleteOpen(false);
      setDeleteRole(null);
      showSuccess("The role deleted successfully");
    } catch (error) {
      handleError({ showError, error });
    }
  };

  useEffect(() => {
    if (!createOpen) {
      setCreateRoleData(initialRole);
    }
  }, [createOpen]);

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
          data={data ?? []}
          isLoading={isLoading}
          emptyText={"No users found."}
          actions={actions}
          className="pb-4"
        />
      ) : (
        <div className="pb-4">
          <CustomTable
            columns={columns}
            data={data ?? []}
            isLoading={isLoading}
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
        handler={handleCreate}
        isLoading={isLoadingCreate}
        content={
          <div className="space-y-4">
            <Input
              placeholder="Role name"
              value={createRoleData?.name}
              onChange={(e) =>
                setCreateRoleData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder="Role level"
              value={createRoleData?.level}
              type="number"
              onChange={(e) =>
                setCreateRoleData((prev) => ({
                  ...prev,
                  level: Number(e.target.value),
                }))
              }
            />

            <PermissionsMatrix
              value={createRoleData.permissions}
              onChange={(val) =>
                setCreateRoleData((prev) => ({ ...prev, permissions: val }))
              }
            />
          </div>
        }
      />

      {editRoleData && (
        <EditBaseDrawer
          handler={handleUpdate}
          content={
            <div className="space-y-4">
              <Input
                placeholder="Role name"
                value={editRoleData.name}
                onChange={(e) =>
                  setEditRoleData((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
              />
              <Input
                placeholder="Role level"
                value={editRoleData.level}
                type="number"
                onChange={(e) =>
                  setEditRoleData((prev) =>
                    prev ? { ...prev, level: Number(e.target.value) } : prev,
                  )
                }
              />

              <PermissionsMatrix
                value={editRoleData.permissions}
                onChange={(val) =>
                  setEditRoleData((prev) =>
                    prev
                      ? {
                          ...prev,
                          permissions: val.map((p) => ({
                            roleId: prev.id,
                            permissionId: p.permissionId,
                          })),
                        }
                      : prev,
                  )
                }
              />
            </div>
          }
          open={editOpen}
          title="Edit Role"
          setOpen={setEditOpen}
          isLoading={isLoadingUpdate}
        />
      )}

      {/* Delete Dialog */}
      <DeleteBaseModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        handleDelete={handleDelete}
        isLoading={isLoadingDelete}
        title="Delete role?"
        description="This action cannot be undone. The role will be permanently removed."
      />
    </div>
  );
}
