import RolesComponent from "@/components/admin/roles";
import { requirePagePermission } from "@/lib/server/requirePagePermission";

export default async function RolesPage() {
  await requirePagePermission("roles.read");

  return <RolesComponent />;
}
