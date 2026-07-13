"use client";

import { useDoctors } from "@/components/queue/queries";
import { Card } from "@/components/ui/card";

export function QueueFilters({
  date,
  onDateChange,
  doctorId,
  onDoctorChange,
}: {
  date: string;
  onDateChange: (date: string) => void;
  doctorId: string;
  onDoctorChange: (doctorId: string) => void;
}) {
  const doctors = useDoctors();

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="block h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Doctor</label>
        <select
          value={doctorId}
          onChange={(e) => onDoctorChange(e.target.value)}
          className="block h-10 min-w-48 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
        >
          <option value="">All Doctors</option>
          {doctors.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
