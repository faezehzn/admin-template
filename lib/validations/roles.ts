import { z } from "zod";

/**
 * permission object
 */
const permissionSchema = z.object({
  roleId: z.string().trim().min(1, "Role ID must be at least 1 character"),
  permissionId: z
    .string()
    .trim()
    .min(1, "Permission ID must be at least 1 character"),
});

/**
 * shared fields
 */
const roleNameSchema = z
  .string()
  .trim()
  .min(2, "Role name must be at least 2 characters")
  .max(50, "Role name must be less than 50 characters");

const permissionsSchema = z
  .array(permissionSchema)
  .min(1, "At least one permission is required");

/**
 * CREATE ROLE
 */
export const createRoleSchema = z.object({
  name: roleNameSchema,
  level: z
    .number()
    .int()
    .min(1, "The access level cannot be less than 1.")
    .max(999, "The access level must be less than 1000."),
  permissions: z
    .array(
      z.object({
        permissionId: z
          .string()
          .trim()
          .min(1, "Permission ID must be at least 1 character"),
      }),
    )
    .min(1, "At least one permission is required"),
});

/**
 * UPDATE ROLE
 */
export const updateRoleSchema = z.object({
  id: z.string().trim().min(1, "Role ID is required"),
  name: roleNameSchema,
  level: z
    .number()
    .int()
    .min(1, "The access level cannot be less than 1.")
    .max(999, "The access level must be less than 1000."),
  permissions: permissionsSchema,
});

/**
 * DELETE ROLE
 */
export const deleteRoleSchema = z.object({
  id: z.string().trim().min(1, "Role ID is required"),
});

/**
 * TYPES
 */
export type PermissionInput = z.infer<typeof permissionSchema>;

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>;
