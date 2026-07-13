import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { DepartmentTrendsCard } from "@/components/dashboard/department-trends-card";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { MedicalStaffCard } from "@/components/dashboard/medical-staff-card";
import { PatientQueueCard } from "@/components/dashboard/patient-queue-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { RevenueAnalyticsCard } from "@/components/dashboard/revenue-analytics-card";
import { PageContainer } from "@/components/layout/page-container";

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PageContainer
      title="Hospital Overview"
      description={`Real-time status for ${today}`}
      actions={<DashboardActions />}
    >
      <div className="space-y-6">
        <KpiSection />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueAnalyticsCard />
          </div>
          <DepartmentTrendsCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <PatientQueueCard />
          <MedicalStaffCard />
          <RecentActivityCard />
        </div>
      </div>
    </PageContainer>
  );
}
