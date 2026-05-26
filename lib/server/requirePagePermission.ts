import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasPermission } from "./hasPermission";

export async function requirePagePermission(permission: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const roleId = session.user.roleId;

  const allowed = hasPermission({roleId, permission});

  if (!allowed) {
    redirect("/admin");
  }

  return session;
}
