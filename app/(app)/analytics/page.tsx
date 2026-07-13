"use client";

import { AttendanceAnalyticsCard } from "@/components/analytics/attendance-analytics-card";
import { PaymentMethodsCard } from "@/components/analytics/payment-methods-card";
import { BillingStats } from "@/components/billing/billing-stats";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { DepartmentTrendsCard } from "@/components/dashboard/department-trends-card";
import { RevenueAnalyticsCard } from "@/components/dashboard/revenue-analytics-card";
import { useDoctors } from "@/components/doctors/queries";
import { StaffOverviewCard } from "@/components/doctors/staff-overview-card";
import { PageContainer } from "@/components/layout/page-container";
import { QueueStats } from "@/components/queue/queue-stats";
import { todayISO } from "@/components/queue/types";

/**
 * Composed entirely from real, already-implemented analytics endpoints —
 * reusing completed screens' own components wherever the data they show is
 * exactly what's needed (BillingStats, RevenueAnalyticsCard,
 * DepartmentTrendsCard, QueueStats, StaffOverviewCard), and adding only the
 * two data slices no existing screen surfaces yet (attendance/no-show
 * detail, payment-method split). Design widgets with no backing endpoint
 * (revenue trend chart, growth rate, department patient-distribution donut,
 * monthly patient-growth chart, wait-time-by-wing, doctor aggregate
 * performance table, export, new-admission, emergency banner) are omitted.
 */
export default function AnalyticsPage() {
  const doctors = useDoctors();
  const today = todayISO();

  return (
    <PageContainer
      title="Analytics & Insights"
      description="Real-time performance and financial health indicators."
    >
      <PermissionGate
        permission="analytics.view"
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the analytics.view permission to view analytics."
          />
        }
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Revenue</h2>
            <BillingStats />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueAnalyticsCard />
              </div>
              <PaymentMethodsCard />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Staff &amp; Departments</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <DepartmentTrendsCard />
              <StaffOverviewCard doctors={doctors.data ?? []} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Queue</h2>
            <QueueStats date={today} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Attendance</h2>
            <AttendanceAnalyticsCard />
          </section>
        </div>
      </PermissionGate>
    </PageContainer>
  );
}
