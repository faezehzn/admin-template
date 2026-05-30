import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});
