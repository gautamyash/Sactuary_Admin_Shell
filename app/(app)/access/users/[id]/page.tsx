import { RequirePermission } from "@/components/access/require-permission";
import { UserDetailView } from "@/components/access/user-detail-view";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequirePermission permission="user.view">
      <UserDetailView id={Number(id)} />
    </RequirePermission>
  );
}
