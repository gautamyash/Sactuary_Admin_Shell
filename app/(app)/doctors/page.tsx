"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DoctorsActions } from "@/components/doctors/doctors-actions";
import { DoctorsFilters } from "@/components/doctors/doctors-filters";
import { DoctorsGrid } from "@/components/doctors/doctors-grid";
import { LeaveManagerDialog } from "@/components/doctors/leave-manager-dialog";
import { useDeleteDoctor, useDoctors } from "@/components/doctors/queries";
import { ScheduleManagerDialog } from "@/components/doctors/schedule-manager-dialog";
import { StaffOverviewCard } from "@/components/doctors/staff-overview-card";
import { EMPTY_FILTERS, type AppliedFilters } from "@/components/doctors/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { PageContainer } from "@/components/layout/page-container";
import type { Doctor } from "@/lib/api/doctors";
import { ApiError } from "@/lib/api/errors";

export default function DoctorsPage() {
  const [filters, setFilters] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");

  const [formDoctor, setFormDoctor] = useState<Doctor | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState<Doctor | null>(null);
  const [leaveDoctor, setLeaveDoctor] = useState<Doctor | null>(null);

  const deleteDoctor = useDeleteDoctor();

  const { data, isLoading, isError, error, refetch } = useDoctors({
    specialty: filters.specialty || undefined,
    search: search || undefined,
  });

  const doctors = useMemo(() => {
    const all = data ?? [];
    if (!filters.status) return all;
    return all.filter((d) => (filters.status === "on_duty" ? d.onDuty : d.onLeave));
  }, [data, filters.status]);

  async function handleDeactivate(doctor: Doctor) {
    if (!window.confirm(`Deactivate ${doctor.name}? This removes them from the directory.`)) {
      return;
    }
    try {
      await deleteDoctor.mutateAsync(doctor.id);
      toast.success(`${doctor.name} deactivated.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not deactivate this doctor.");
    }
  }

  return (
    <PageContainer
      title="Doctor Management"
      description="Monitor and manage professional staff scheduling and status."
      actions={
        <DoctorsActions
          onOnboard={() => {
            setFormDoctor(null);
            setFormOpen(true);
          }}
        />
      }
    >
      <div className="space-y-6">
        <DoctorsFilters
          filters={filters}
          onFiltersChange={setFilters}
          search={search}
          onSearchChange={setSearch}
        />

        <StaffOverviewCard doctors={doctors} />

        {isLoading ? (
          <LoadingScreen label="Loading doctors…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <DoctorsGrid
            doctors={doctors}
            onEdit={(doctor) => {
              setFormDoctor(doctor);
              setFormOpen(true);
            }}
            onDeactivate={handleDeactivate}
            onManageSchedule={setScheduleDoctor}
            onManageLeave={setLeaveDoctor}
          />
        )}
      </div>

      <DoctorFormDialog doctor={formDoctor} open={formOpen} onOpenChange={setFormOpen} />
      <ScheduleManagerDialog
        doctor={scheduleDoctor}
        open={!!scheduleDoctor}
        onOpenChange={(open) => !open && setScheduleDoctor(null)}
      />
      <LeaveManagerDialog
        doctor={leaveDoctor}
        open={!!leaveDoctor}
        onOpenChange={(open) => !open && setLeaveDoctor(null)}
      />
    </PageContainer>
  );
}
