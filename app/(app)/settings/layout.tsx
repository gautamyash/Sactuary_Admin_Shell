import { RequirePermission } from "@/components/access/require-permission";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { PageContainer } from "@/components/layout/page-container";

/**
 * Hospital Settings module shell. Gated on settings.view (already seeded,
 * granted to Owner/Admin); individual Save actions inside each section are
 * further gated on settings.edit via SettingsSectionCard / ConfigurationValueRow.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission permission="settings.view">
      <PageContainer
        title="Hospital Settings"
        description="Hospital profile, branding, contact details, localization, and feature configuration."
      >
        <SettingsTabs />
        {children}
      </PageContainer>
    </RequirePermission>
  );
}
