import UsersComponent from "@/components/admin/users";
import { requirePagePermission } from "@/lib/server/requirePagePermission";

export default async function UsersPage() {
  await requirePagePermission("users.read");

  return <UsersComponent />;
}
