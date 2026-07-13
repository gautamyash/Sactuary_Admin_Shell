import { AccessTabs } from "@/components/access/access-tabs";
import { RequirePermission } from "@/components/access/require-permission";
import { PageContainer } from "@/components/layout/page-container";

/**
 * Access Management module shell. The whole module requires either user.view
 * (to browse users) or system.admin (to manage roles/permissions); individual
 * sub-pages enforce the finer-grained code.
 */
export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission anyOf={["user.view", "system.admin"]}>
      <PageContainer
        title="Access Management"
        description="Manage hospital users, roles, and granular permissions across all modules."
      >
        <AccessTabs />
        {children}
      </PageContainer>
    </RequirePermission>
  );
}
