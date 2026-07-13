"use client";

import type { Doctor } from "@/lib/api/doctors";

/**
 * The Stitch design's "Staff Overview" bento box shows four stats (Total
 * Doctors, On Duty, Efficiency, In Surgery). Only the first two have any
 * backing data — there is no efficiency or surgery-tracking concept in the
 * API — so only those two are shown, computed for real from the currently
 * loaded directory rather than fabricated.
 */
export function StaffOverviewCard({ doctors }: { doctors: Doctor[] }) {
  const total = doctors.length;
  const onDuty = doctors.filter((d) => d.onDuty).length;

  return (
    <div className="flex flex-col justify-center gap-6 rounded-xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-around">
      <div>
        <h3 className="mb-1 text-base font-semibold">Staff Overview</h3>
        <p className="text-sm opacity-80">Directory snapshot for today.</p>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-xs uppercase tracking-wide opacity-80">Total Doctors</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold">{onDuty}</span>
          <span className="text-xs uppercase tracking-wide opacity-80">On Duty</span>
        </div>
      </div>
    </div>
  );
}
