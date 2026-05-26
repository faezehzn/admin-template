"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn, handleGroupPermissions } from "@/lib/utils";
import { useGetPermissionsQuery } from "@/stores/permissionApi";
import { Permission } from "@prisma/client";

type Props = {
  value: {
    permissionId: string;
  }[];
  onChange: (
    val: {
      permissionId: string;
    }[],
  ) => void;
  className?: string;
};

export default function PermissionsMatrix({
  value,
  onChange,
  className,
}: Props) {
  const { data: dataRolePermission } = useGetPermissionsQuery();

  const isChecked = (permission: Permission) => {
    return value.some((p) => p.permissionId === permission.id);
  };

  const group = handleGroupPermissions(dataRolePermission ?? []) ?? [];

  const togglePermission = (permission: Permission) => {
    const exists = value.find((p) => p.permissionId === permission.id);

    // remove permission from value
    if (exists) {
      onChange(value.filter((p) => p.permissionId !== permission.id));
      return;
    }

    // add permission from value
    onChange([...value, { permissionId: permission.id }]);
  };

  return (
    <div
      className={cn("border border-border rounded-xl p-4 space-y-4", className)}
    >
      <div>
        <h2 className="text-lg font-semibold">Permissions</h2>
        <p className="text-sm text-diactive mt-1">
          Select access levels for this role
        </p>
      </div>

      {Object.entries(group)?.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1 w-full">
          <h3 className="font-medium text-sm uppercase tracking-wide text-primary-500">
            {value.label}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {value.permissions?.map((permission) => {
              const checked = isChecked(permission);
              const action = permission.name.split(".")[1];

              return (
                <label
                  key={permission.id}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 cursor-pointer transition-colors",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => togglePermission(permission)}
                  />

                  <span className="text-sm capitalize">{action}</span>
                </label>
              );
            })}
          </div>

          <Separator className="mt-2" />
        </div>
      ))}
    </div>
  );
}
