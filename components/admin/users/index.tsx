"use client";

import EditBaseDrawer from "@/components/admin/edit-base-drawer";
import Can from "@/components/auth/can";
import CreateBaseModal from "@/components/modals/create-base-modal";
import { DeleteBaseModal } from "@/components/modals/delete-base-modal";
import { FormField } from "@/components/shared/formField";
import { Pagination } from "@/components/shared/pagination";
import { RelationSelect } from "@/components/shared/relationSelect";
import { CustomTable } from "@/components/shared/table";
import { Action, Column } from "@/components/shared/table/type";
import { TableMobile } from "@/components/shared/tableMobile";
import { Tooltip } from "@/components/shared/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useErrorToast, useSuccessToast } from "@/hooks/useCustomToasts";
import { useDebounce } from "@/hooks/useDebounce";
import useMobileSize from "@/hooks/useMobileSize";
import { handleError } from "@/lib/errorHandler";
import { requirePagePermission } from "@/lib/server/requirePagePermission";
import { cn } from "@/lib/utils";
import { useGetRolesQuery } from "@/stores/rolesApi";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/stores/usersApi";
import { UserListItem } from "@/types/prisma";
import { UserStatus } from "@prisma/client";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UsersComponent() {
  const { data: session } = useSession();
  const { show: showSuccess } = useSuccessToast();
  const { show: showError } = useErrorToast();
  const { isMobileSize } = useMobileSize();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    roleId: "",
  });
  const [editUserData, setEditUserData] = useState<UserListItem | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "createdAt" | "name" | "email" | "status" | "role"
  >("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortDir,
  });
  const [createUserMutation, { isLoading: isCreating }] =
    useCreateUserMutation();
  const [updateUserMutation, { isLoading: isUpdating }] =
    useUpdateUserMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const { data: roles } = useGetRolesQuery();

  const users = data?.items ?? [];
  const meta = data?.meta;

  const columns: Column<UserListItem>[] = [
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
              <Avatar className="block h-6 w-6 lg:h-8 lg:w-8">
                <AvatarFallback className=" text-sm! lg:text-base!">
                  {row.name ? row.name.charAt(0) : row.email.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {row.name && (
                <span className="font-medium md:max-w-20 lg:max-w-48 xl:max-w-60 md:truncate">
                  {row.name}
                </span>
              )}
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
      cellClassName: "md:max-w-24 lg:max-w-52 xl:max-w-60 truncate",
      sortKey: "email",
      sortable: true,
    },

    {
      header: "role",
      accessor: (row) => row.role.name,
      sortKey: "role",
      sortable: true,
    },
    {
      header: "created at",
      accessor: (row) => (
        <Tooltip
          side={"bottom"}
          content={new Date(row.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          offOrOn={isMobileSize ? "off" : "on"}
          className={cn(" justify-center")}
        >
          <span>
            {isMobileSize
              ? new Date(row.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date(row.createdAt).toLocaleDateString("en-US")}
          </span>
        </Tooltip>
      ),
      sortKey: "createdAt",
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

  const actions: Action<UserListItem>[] = [
    {
      label: (
        <Can permission="users.update">
          <Tooltip
            side={"bottom"}
            content={"Edit"}
            className={cn(" justify-center")}
          >
            <span>
              <Pencil size={16} className="w-full min-w-4" />
            </span>
          </Tooltip>
        </Can>
      ),
      variant: "ghost",
      onClick: (row) => {
        setEditOpen(true);
        setEditUserData(row);
      },
      disabled: (row) => row.id === session?.user.id,
    },
    {
      label: (
        <Can permission="users.delete">
          <Tooltip
            side={"bottom"}
            content={"Delete"}
            className={cn(" justify-center")}
          >
            <span>
              <Trash2 size={16} className="w-full min-w-4" />
            </span>
          </Tooltip>
        </Can>
      ),
      variant: "danger",
      onClick: (row) => {
        setDeleteUserId(row.id);
        setDeleteOpen(true);
      },
      disabled: (row) => row.id === session?.user.id,
    },
  ];

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    const resp = await deleteUserMutation(deleteUserId);

    if (resp.error) {
      handleError({ showError, error: resp.error });
      return;
    }
    setDeleteOpen(false);
    setDeleteUserId(null);
    showSuccess("User deleted successfully.");
  };

  const handleEditUser = async () => {
    if (!editUserData) return;

    const resp = await updateUserMutation({ ...editUserData });
    if (resp.error) {
      handleError({ showError, error: resp.error });
      return;
    }

    setEditOpen(false);
    setEditUserData(null);
    showSuccess("User updated successfully.");
  };

  const handleCreateUser = async () => {
    const res = await createUserMutation({
      name: createForm.name || null,
      email: createForm.email,
      roleId: createForm.roleId,
    });

    if (res.error) {
      handleError({ showError, error: res.error });
      return;
    }

    setCreateOpen(false);
    setCreateForm({ name: "", email: "", roleId: "" });
    showSuccess("User created successfully.");
  };

  return (
    <div className="flex flex-col gap-6 justify-between w-full text-primary-700 ">
      <div className="flex flex-col gap-4 w-full">
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
            placeholder="Search users..."
            className="pl-9 w-full sm:w-72 bg-primary-50"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* sort data -mobile size */}
        {isMobileSize && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-400">Sort</span>
            <Select
              value={`${sortBy}-${sortDir}`}
              onValueChange={(v) => {
                const [key, dir] = v.split("-");
                setSortBy(key as typeof sortBy);
                setSortDir(dir as typeof sortDir);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full bg-primary-50">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {columns
                  .filter((c) => c.sortable)
                  .flatMap((c) => [
                    <SelectItem
                      key={`${c.sortKey}-asc`}
                      value={`${c.sortKey}-asc`}
                    >
                      {c.header} (A → Z / Oldest)
                    </SelectItem>,
                    <SelectItem
                      key={`${c.sortKey}-desc`}
                      value={`${c.sortKey}-desc`}
                    >
                      {c.header} (Z → A / Newest)
                    </SelectItem>,
                  ])}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Desktop/Mobile Table */}
        {isMobileSize ? (
          <TableMobile
            columns={columns}
            data={users}
            isLoading={isLoading || isFetching}
            emptyText={
              search ? "No users match your search." : "No users found."
            }
            actions={actions}
          />
        ) : (
          <CustomTable
            columns={columns}
            data={users}
            isLoading={isLoading || isFetching}
            emptyText={
              search ? "No users match your search." : "No users found."
            }
            actions={actions}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={(key, dir) => {
              setSortBy(key as typeof sortBy);
              setSortDir(dir);
              setPage(1);
            }}
          />
        )}
      </div>

      {meta && meta.pageCount > 1 && (
        <Pagination
          page={meta.page}
          pageCount={meta.pageCount}
          total={meta.total}
          pageSize={meta.pageSize}
          isLoading={isFetching}
          onPageChange={(p) => setPage(p)}
          showPageSizeSelector={true}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      )}

      {/* Create Modal */}
      <CreateBaseModal
        open={createOpen}
        setOpen={setCreateOpen}
        title="Create User"
        description="Create a new user by filling out the form below."
        handler={handleCreateUser}
        onClose={() =>
          setCreateForm({
            name: "",
            email: "",
            roleId: "",
          })
        }
        isLoading={isCreating}
        content={
          <>
            <FormField id="fullName" label="Full name">
              <Input
                id="fullName"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </FormField>

            <FormField id="email" label="Email">
              <Input
                id="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </FormField>

            {/* Role Select */}
            <FormField label="Select role">
              <Select
                value={createForm.roleId}
                onValueChange={(v) =>
                  setCreateForm((p) => ({ ...p, roleId: v }))
                }
              >
                <SelectTrigger className="bg-primary-50 w-full capitalize">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    ?.filter((item) => item.level < session!.user.roleLevel)
                    .map((r) => (
                      <SelectItem
                        key={r.id}
                        value={r.id}
                        className="capitalize"
                      >
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
          </>
        }
      />

      {/* Edit Drawer */}
      {editUserData && (
        <EditBaseDrawer
          handler={handleEditUser}
          isLoading={isUpdating}
          onClose={() => setEditUserData(null)}
          content={
            <div className="flex flex-col gap-4 w-full">
              <FormField id="fullName" label="Full name">
                <Input
                  id="fullName"
                  value={editUserData.name ?? ""}
                  onChange={(e) =>
                    setEditUserData((p) =>
                      p ? { ...p, name: e.target.value } : p,
                    )
                  }
                />
              </FormField>
              <FormField id="email" label="Email">
                <Input
                  id="email"
                  placeholder="Email"
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData((p) =>
                      p ? { ...p, email: e.target.value } : p,
                    )
                  }
                />
              </FormField>

              <FormField label="Select role">
                <Select
                  value={editUserData.roleId}
                  onValueChange={(v) =>
                    setEditUserData((p) => (p ? { ...p, roleId: v } : p))
                  }
                >
                  <SelectTrigger className="bg-primary-50 w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles
                      ?.filter((item) => item.level < session!.user.roleLevel)
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status">
                <Select
                  value={editUserData.status}
                  onValueChange={(v) =>
                    setEditUserData((p) =>
                      p
                        ? {
                            ...p,
                            status: v as UserStatus,
                          }
                        : p,
                    )
                  }
                >
                  <SelectTrigger className="bg-primary-50 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactive">Deactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
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
        handleDelete={handleDeleteUser}
        title="Delete user?"
        description="This action cannot be undone. The user will be permanently removed."
        isLoading={isDeleting}
      />
    </div>
  );
}
