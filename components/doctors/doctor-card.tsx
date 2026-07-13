"use client";

import { MoreVertical, Pencil, UserX } from "lucide-react";
import { useState } from "react";

import { DoctorStatusBadge } from "@/components/doctors/doctor-status-badge";
import { formatTime, locationSummary, todayWeekday } from "@/components/doctors/types";
import { PermissionGate } from "@/components/common/permission-gate";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DoctorLeave } from "@/lib/api/doctor-leaves";
import type { DoctorSchedule } from "@/lib/api/doctor-schedules";
import type { Doctor } from "@/lib/api/doctors";

export function DoctorCard({
  doctor,
  todaysSchedule,
  scheduleLoading,
  activeLeave,
  leaveLoading,
  onEdit,
  onDeactivate,
  onManageSchedule,
  onManageLeave,
}: {
  doctor: Doctor;
  todaysSchedule: DoctorSchedule[];
  scheduleLoading: boolean;
  activeLeave: DoctorLeave | null;
  leaveLoading: boolean;
  onEdit: (doctor: Doctor) => void;
  onDeactivate: (doctor: Doctor) => void;
  onManageSchedule: (doctor: Doctor) => void;
  onManageLeave: (doctor: Doctor) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = locationSummary(doctor);
  const today = todayWeekday();
  const blocksToday = todaysSchedule
    .filter((s) => s.weekday === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start gap-3 p-5">
        <Avatar name={doctor.name} src={doctor.photo} className="size-16 rounded-xl text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{doctor.name}</h3>
          <p className="truncate text-sm font-medium text-primary">{doctor.specialty}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DoctorStatusBadge onDuty={doctor.onDuty} onLeave={doctor.onLeave} />
            {location && <span className="text-xs text-muted-foreground">• {location}</span>}
          </div>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Doctor actions"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                <PermissionGate permission="system.admin">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(doctor);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    Edit Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDeactivate(doctor);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    <UserX className="size-3.5" />
                    Deactivate
                  </button>
                </PermissionGate>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 pb-5">
        {doctor.onLeave ? (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm italic text-muted-foreground">
            <p className="mb-1 text-xs font-bold uppercase not-italic text-muted-foreground">
              Notice
            </p>
            {leaveLoading ? (
              "Loading leave details…"
            ) : activeLeave ? (
              <>
                {activeLeave.reason || "Staff member is currently on leave."}
                {" "}
                <span className="not-italic text-foreground">
                  Returning {new Date(`${activeLeave.endDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
                </span>
              </>
            ) : (
              "Marked on-leave — no matching leave record found for today."
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Today&apos;s Schedule
            </p>
            {scheduleLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : blocksToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedule blocks for today.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {blocksToday.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{b.slotMinutes}-minute slots</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(b.startTime)} - {formatTime(b.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 px-5 pb-5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onManageSchedule(doctor)}
        >
          Manage Schedule
        </Button>
        <Button className="flex-1" onClick={() => onManageLeave(doctor)}>
          Manage Leave
        </Button>
      </div>
    </Card>
  );
}
