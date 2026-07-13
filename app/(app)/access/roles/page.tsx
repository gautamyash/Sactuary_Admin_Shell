import { RequirePermission } from "@/components/access/require-permission";
import { RolesList } from "@/components/access/roles-list";

export default function RolesPage() {
  return (
    <RequirePermission permission="system.admin">
      <RolesList />
    </RequirePermission>
  );
}
