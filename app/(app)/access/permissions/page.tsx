import { PermissionsList } from "@/components/access/permissions-list";
import { RequirePermission } from "@/components/access/require-permission";

export default function PermissionsPage() {
  return (
    <RequirePermission permission="system.admin">
      <PermissionsList />
    </RequirePermission>
  );
}
