"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const permissions = {
  Users: ["create", "read", "update", "delete"],
  Roles: ["create", "read", "update", "delete"],
  Settings: ["read", "update"],
};

export default function PermissionsMatrix() {
  return (
    <div className="border rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold">Permissions</h2>

      {Object.entries(permissions).map(([resource, actions]) => (
        <div key={resource}>
          <h3 className="font-medium mb-3">{resource}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <label key={action} className="flex items-center gap-2 text-sm">
                <Checkbox />
                <span className="capitalize">{action}</span>
              </label>
            ))}
          </div>

          <Separator className="my-4" />
        </div>
      ))}
    </div>
  );
}
