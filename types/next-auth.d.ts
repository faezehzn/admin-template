import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      role: string;
      avatar?: string |null;
      status?: "active" |"deactive"
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    avatar?: string |null;
    status?: "active" | "deactive";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    avatar?: string |null;
    status?: "active" | "deactive";
  }
}
