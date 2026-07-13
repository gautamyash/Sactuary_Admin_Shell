"use client";

import { useState } from "react";

import { AppointmentStats } from "@/components/appointments/appointment-stats";
import { AppointmentsActions } from "@/components/appointments/appointments-actions";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { CalendarView } from "@/components/appointments/calendar-view";
import { FiltersPanel } from "@/components/appointments/filters-panel";
import { UpcomingHighlights } from "@/components/appointments/upcoming-highlights";
import { EMPTY_FILTERS, type AppliedFilters } from "@/components/appointments/types";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { PageContainer } from "@/components/layout/page-container";

export default function AppointmentsPage() {
  const [filters, setFilters] = useState<AppliedFilters>(EMPTY_FILTERS);

  return (
    <PageContainer
      title="Appointments Management"
      description="Manage and monitor patient schedules across all departments."
      actions={<AppointmentsActions />}
    >
      <PermissionGate
        permission="appointment.view"
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the appointment.view permission to view appointments."
          />
        }
      >
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CalendarView filters={filters} />
            </div>
            <div className="space-y-6">
              <FiltersPanel value={filters} onApply={setFilters} />
              <AppointmentStats />
              <UpcomingHighlights />
            </div>
          </div>

          <AppointmentsTable filters={filters} />
        </div>
      </PermissionGate>
    </PageContainer>
  );
}
