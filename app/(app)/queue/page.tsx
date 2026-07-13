"use client";

import { useState } from "react";

import { QueueBoard } from "@/components/queue/queue-board";
import { QueueFilters } from "@/components/queue/queue-filters";
import { QueueStats } from "@/components/queue/queue-stats";
import { todayISO } from "@/components/queue/types";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { PageContainer } from "@/components/layout/page-container";

export default function QueuePage() {
  const [date, setDate] = useState(todayISO());
  const [doctorId, setDoctorId] = useState("");

  return (
    <PageContainer
      title="Queue Monitoring"
      description="Track live doctor queues, delays, and consultation progress across the hospital."
    >
      <PermissionGate
        permission="queue.view"
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the queue.view permission to view the queue."
          />
        }
      >
        <div className="space-y-6">
          <QueueFilters
            date={date}
            onDateChange={setDate}
            doctorId={doctorId}
            onDoctorChange={setDoctorId}
          />
          <QueueStats date={date} doctorId={doctorId || undefined} />
          <QueueBoard date={date} doctorId={doctorId || undefined} />
        </div>
      </PermissionGate>
    </PageContainer>
  );
}
