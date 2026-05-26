import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        const role = await prisma.role.findUnique({
          where: {
            id: user.roleId,
          },

          select: {
            id: true,
            name: true,
            level: true,
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        });
        const permissions =
          role?.permissions.map((p) => p.permission.name) ?? [];

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role.name,
          roleId: user.role.id,
          avatar: user.avatar ?? undefined,
          status: user.status,
          permissions,
          roleLevel: role?.level ?? 1
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.roleId = user.roleId;
        token.avatar = user.avatar;
        token.status = user.status;
        token.permissions = user.permissions;
        token.roleLevel = user.roleLevel;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.roleId = token.roleId;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.permissions = token.permissions;
        session.user.roleLevel = token.roleLevel;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
