import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { hasPermission } from "@/lib/permissions";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const role = session.user.role;

  if (!hasPermission(role, "users.create")) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json({ success: true });
}
