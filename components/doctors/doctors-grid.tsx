"use client";

import { useMemo } from "react";

import { DoctorCard } from "@/components/doctors/doctor-card";
import { useDoctorLeavesBatch, useDoctorSchedulesBatch } from "@/components/doctors/queries";
import { todayISO } from "@/components/doctors/types";
import type { DoctorLeave } from "@/lib/api/doctor-leaves";
import type { Doctor } from "@/lib/api/doctors";

function activeLeaveFor(leaves: DoctorLeave[] | undefined, today: string): DoctorLeave | null {
  if (!leaves) return null;
  return leaves.find((l) => l.startDate <= today && today <= l.endDate) ?? null;
}

/** Pure presentational grid — the doctor list itself (fetch, filter, loading,
 * error) is owned by the page so Staff Overview can share the same data
 * without a second request. This component only handles the per-doctor
 * schedule/leave batch fetches needed to render each card's detail box. */
export function DoctorsGrid({
  doctors,
  onEdit,
  onDeactivate,
  onManageSchedule,
  onManageLeave,
}: {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDeactivate: (doctor: Doctor) => void;
  onManageSchedule: (doctor: Doctor) => void;
  onManageLeave: (doctor: Doctor) => void;
}) {
  const onLeaveIds = useMemo(() => doctors.filter((d) => d.onLeave).map((d) => d.id), [doctors]);
  const scheduledIds = useMemo(() => doctors.filter((d) => !d.onLeave).map((d) => d.id), [doctors]);

  const scheduleResults = useDoctorSchedulesBatch(scheduledIds);
  const leaveResults = useDoctorLeavesBatch(onLeaveIds);

  const today = todayISO();

  if (doctors.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No doctors match these filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {doctors.map((doctor) => {
        if (doctor.onLeave) {
          const idx = onLeaveIds.indexOf(doctor.id);
          const result = leaveResults[idx];
          return (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              todaysSchedule={[]}
              scheduleLoading={false}
              activeLeave={activeLeaveFor(result?.data, today)}
              leaveLoading={result?.isLoading ?? true}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onManageSchedule={onManageSchedule}
              onManageLeave={onManageLeave}
            />
          );
        }
        const idx = scheduledIds.indexOf(doctor.id);
        const result = scheduleResults[idx];
        return (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            todaysSchedule={result?.data ?? []}
            scheduleLoading={result?.isLoading ?? true}
            activeLeave={null}
            leaveLoading={false}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onManageSchedule={onManageSchedule}
            onManageLeave={onManageLeave}
          />
        );
      })}
    </div>
  );
}
