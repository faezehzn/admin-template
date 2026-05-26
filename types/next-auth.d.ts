import { UserStatus } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email: string;
      role: string;
      roleId: string;
      avatar?: string | null;
      status: UserStatus;
      permissions: string[];
      roleLevel: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string;
    email: string;
    role: string;
    roleId: string;
    avatar?: string | null;
    status: UserStatus;
    roleLevel: number;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    email: string;
    role: string;
    roleId: string;
    avatar?: string | null;
    status: UserStatus;
    roleLevel: number;
    permissions: string[];
  }
}
