"use client";

import { useMemo } from "react";

import { DoctorQueueCard } from "@/components/queue/doctor-queue-card";
import { useDoctorQueues, useDoctors } from "@/components/queue/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";

export function QueueBoard({ date, doctorId }: { date: string; doctorId?: string }) {
  const doctorsQuery = useDoctors();

  const doctors = useMemo(() => {
    const all = doctorsQuery.data ?? [];
    return doctorId ? all.filter((d) => String(d.id) === doctorId) : all;
  }, [doctorsQuery.data, doctorId]);

  const doctorIds = useMemo(() => doctors.map((d) => d.id), [doctors]);
  const queueResults = useDoctorQueues(doctorIds, date);

  if (doctorsQuery.isLoading) {
    return <LoadingScreen label="Loading doctors…" />;
  }
  if (doctorsQuery.isError) {
    return <ErrorState error={doctorsQuery.error} onRetry={() => doctorsQuery.refetch()} />;
  }
  if (doctors.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No doctors match this filter.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {doctors.map((doctor, i) => {
        const result = queueResults[i];
        return (
          <DoctorQueueCard
            key={doctor.id}
            doctor={doctor}
            queue={result?.data}
            isLoading={result?.isLoading ?? true}
            isError={result?.isError ?? false}
            onRetry={() => result?.refetch()}
          />
        );
      })}
    </div>
  );
}
