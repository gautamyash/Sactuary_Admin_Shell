import { RequirePermission } from "@/components/access/require-permission";
import { UsersTable } from "@/components/access/users-table";

export default function UsersPage() {
  return (
    <RequirePermission permission="user.view">
      <UsersTable />
    </RequirePermission>
  );
}
