export type Permission =
  | "users.create"
  | "users.read"
  | "users.update"
  | "users.delete"
  | "roles.create"
  | "roles.read"
  | "roles.update"
  | "roles.delete"
  | "settings.read"
  | "settings.update";

type Role = "admin" | "editor" | "viewer";

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
    "roles.create",
    "roles.read",
    "roles.update",
    "roles.delete",
    "settings.read",
    "settings.update",
  ],

  editor: ["users.read", "users.update", "roles.read", "settings.read"],

  viewer: ["users.read", "roles.read"],
};

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission);
}
