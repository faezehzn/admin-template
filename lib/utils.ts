import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Permission } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleGroupPermissions(permissions: Permission[]) {
  return permissions.reduce<
    Record<
      string,
      {
        label: string;
        permissions: Permission[];
      }
    >
  >((acc, permission) => {
    const [resource] = permission.name.split(".");

    if (!acc[resource]) {
      acc[resource] = {
        label:
          resource.charAt(0).toUpperCase() + resource.slice(1),

        permissions: [],
      };
    }

    acc[resource].permissions.push(permission);

    return acc;
  }, {});
}