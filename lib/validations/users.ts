import { UserStatus } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .nullable()
    .optional(),
  email: z.string().trim().email("Invalid email address"),
  roleId: z.string().trim().min(1, "Role is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const usersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().trim().optional().default(""),
  sortBy: z.enum(["createdAt", "name", "email", "status", "role"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const updateUserSchema = createUserSchema.extend({
  id: z.string().trim().min(1, "User ID is required"),
  status: z.nativeEnum(UserStatus).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
