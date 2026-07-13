"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { useDoctorOptions, useSpecialtyOptions } from "@/components/appointments/queries";
import { STATUS_OPTIONS, type AppliedFilters } from "@/components/appointments/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FiltersPanel({
  value,
  onApply,
}: {
  value: AppliedFilters;
  onApply: (filters: AppliedFilters) => void;
}) {
  const specialties = useSpecialtyOptions();
  const doctors = useDoctorOptions();
  const [draft, setDraft] = useState<AppliedFilters>(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Appointment Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <select
            value={draft.department}
            onChange={(e) => setDraft({ ...draft, department: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
            <option value="">All Departments</option>
            {specialties.data?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const active = draft.status === opt.value;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => setDraft({ ...draft, status: opt.value })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Assigned Doctor</label>
          <select
            value={draft.doctorId}
            onChange={(e) => setDraft({ ...draft, doctorId: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
            <option value="">All Doctors</option>
            {doctors.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <Button className="w-full" onClick={() => onApply(draft)}>
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
