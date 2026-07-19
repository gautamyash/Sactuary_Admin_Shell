"use client";

import { CalendarPlus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useDoctorOptions } from "@/components/appointments/queries";
import {
  useCreateFollowUpAppointment,
  usePatientAppointments,
  usePatientVisits,
  useUpdateVisitNotes,
} from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { MedicalVisit } from "@/lib/api/records";

type FollowUpStatus = "completed" | "overdue" | "scheduled";

const STATUS_LABEL: Record<FollowUpStatus, string> = {
  completed: "Completed",
  overdue: "Overdue",
  scheduled: "Scheduled",
};

const STATUS_VARIANT: Record<FollowUpStatus, BadgeVariant> = {
  completed: "success",
  overdue: "destructive",
  scheduled: "warning",
};

/** Derived purely from data already loaded via usePatientVisits — no new
 * schema, no new endpoint. Mirrors the exact "met" rule the backend's
 * RecordsAnalyticsView already uses for its follow_up_compliance metric: a
 * follow-up counts as met if the patient has another visit created on/after
 * the follow-up date. Not met + date in the past = overdue; not met + date
 * still ahead = scheduled. */
function deriveFollowUpStatus(
  visit: MedicalVisit,
  allVisits: MedicalVisit[],
): FollowUpStatus | null {
  if (!visit.followUpDate) return null;
  const followUp = new Date(`${visit.followUpDate}T00:00:00`);
  const met = allVisits.some(
    (other) => other.id !== visit.id && new Date(other.createdAt) >= followUp,
  );
  if (met) return "completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return followUp < today ? "overdue" : "scheduled";
}

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

/**
 * "Follow-up & Care Plan" for a single visit, opened from the Medical Visits
 * card (Phase: Admin Follow-up & Care Plan). Reuses the same fixed-overlay
 * dialog chrome as the other visit-scoped dialogs.
 *
 * Follow-up: displays follow_up_date (editable — reuses the existing
 * VisitNotesView via useUpdateVisitNotes, the same endpoint the Clinical
 * Notes dialog already uses, sending only follow_up_date so chief_complaint/
 * diagnosis/clinical_notes are left untouched) and a derived status badge
 * (see deriveFollowUpStatus above) — no new backend field.
 *
 * Care Plan: MedicalVisit has no dedicated care-plan model or field, so per
 * this phase's scope this section reuses the existing Diagnosis and
 * Clinical Notes fields (read-only here — editing them stays in the
 * dedicated Clinical Notes dialog, so the same fields aren't writable from
 * two places).
 *
 * Scheduling: "Book follow-up" reuses the exact same booking engine the
 * patient-facing self-service flow already uses (AppointmentSerializer +
 * BookingService.book(), via the new admin-facing POST on
 * AdminAppointmentListView) — no parallel booking system. The date field
 * defaults to the visit's follow_up_date when set. A booked appointment
 * flows into the timeline exactly the way every appointment already does:
 * nothing here changes MedicalTimelineService or PatientJourney — once
 * staff later complete the appointment via the existing "Add Visit" action,
 * it becomes a MedicalVisit and appears on the timeline as it always has.
 *
 * The patient's upcoming appointments (usePatientAppointments — the same
 * hook/query AddVisitDialog already uses, not a new one) are listed below
 * the form so staff can see the booking succeeded and avoid double-booking.
 */
export function FollowUpCarePlanDialog({
  patientId,
  visitId,
  open,
  onOpenChange,
}: {
  patientId: number;
  visitId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const visits = usePatientVisits(patientId);
  const appointments = usePatientAppointments(patientId);
  const doctors = useDoctorOptions();
  const updateVisitNotes = useUpdateVisitNotes(patientId);
  const createFollowUp = useCreateFollowUpAppointment(patientId);

  const [followUpDate, setFollowUpDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [reason, setReason] = useState("");
  const [bookError, setBookError] = useState<string | null>(null);

  const visit = visits.data?.find((v) => v.id === visitId) ?? null;

  const resetDeps = [open, visitId, visits.data];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    if (visits.data) {
      const v = visits.data.find((vv) => vv.id === visitId) ?? null;
      setFollowUpDate(v?.followUpDate ?? "");
      setDateError(null);
      setDoctorId("");
      setBookDate(v?.followUpDate ?? "");
      setBookTime("");
      setReason(v ? `Follow-up for visit on ${formatDate(v.date)}` : "");
      setBookError(null);
    }
  }

  if (!open || visitId === null) return null;

  const status = visit ? deriveFollowUpStatus(visit, visits.data ?? []) : null;

  const upcoming = (appointments.data ?? []).filter((a) =>
    ["confirmed", "pending"].includes(a.status),
  );

  async function saveFollowUpDate(e: FormEvent) {
    e.preventDefault();
    setDateError(null);
    try {
      await updateVisitNotes.mutateAsync({
        visitId: visitId!,
        input: { followUpDate: followUpDate || null },
      });
      toast.success("Follow-up date updated.");
    } catch (err) {
      setDateError(err instanceof ApiError ? err.message : "Could not update follow-up date.");
    }
  }

  async function bookFollowUp(e: FormEvent) {
    e.preventDefault();
    setBookError(null);
    if (!doctorId) {
      setBookError("Choose a doctor.");
      return;
    }
    if (!bookDate) {
      setBookError("Choose a date.");
      return;
    }
    if (!bookTime) {
      setBookError("Choose a time.");
      return;
    }
    try {
      await createFollowUp.mutateAsync({
        patientId,
        doctorId: Number(doctorId),
        date: bookDate,
        time: bookTime,
        reason: reason.trim() || undefined,
      });
      toast.success("Follow-up appointment booked.");
      setBookTime("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setBookError("That slot was just booked by someone else. Choose another time.");
      } else {
        setBookError(
          err instanceof ApiError ? err.message : "Could not book this appointment.",
        );
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => onOpenChange(false)} />
      <div className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-y-auto p-6 pr-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Follow-up &amp; Care Plan</h2>
            {visit && (
              <p className="text-sm text-muted-foreground">
                {visit.doctorName} · {visit.specialty}
              </p>
            )}
          </div>

          {visits.isLoading ? (
            <LoadingScreen label="Loading visit…" />
          ) : visits.isError ? (
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          ) : (
            <div className="space-y-5">
              <section className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Follow-up</p>
                  {status && (
                    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                  )}
                </div>
                <form onSubmit={saveFollowUpDate} className="space-y-3">
                  <FormField label="Follow-up date" hint="Optional.">
                    <input
                      type="date"
                      className={inputClass}
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </FormField>
                  {dateError && <p className="text-sm text-destructive">{dateError}</p>}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateVisitNotes.isPending} size="sm">
                      {updateVisitNotes.isPending && (
                        <Spinner className="text-primary-foreground" />
                      )}
                      Save date
                    </Button>
                  </div>
                </form>
              </section>

              <section className="space-y-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Care Plan</p>
                <p className="text-xs text-muted-foreground">
                  Diagnosis and clinical notes from this visit — edit them from the Clinical
                  Notes action.
                </p>
                <div className="space-y-2 pt-1">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Diagnosis
                    </p>
                    <p className="text-sm text-foreground">{visit?.diagnosis || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Clinical Notes
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {visit?.clinicalNotes || "—"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Book follow-up appointment</p>
                <PermissionGate permission="appointment.create">
                  <form onSubmit={bookFollowUp} className="space-y-3">
                    <FormField label="Doctor">
                      <select
                        className={inputClass}
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                      >
                        <option value="">
                          {doctors.isLoading ? "Loading doctors…" : "Choose a doctor"}
                        </option>
                        {(doctors.data ?? []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} · {d.specialty}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Date">
                        <input
                          type="date"
                          min={todayISO()}
                          className={inputClass}
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                        />
                      </FormField>
                      <FormField label="Time">
                        <input
                          type="time"
                          className={inputClass}
                          value={bookTime}
                          onChange={(e) => setBookTime(e.target.value)}
                        />
                      </FormField>
                    </div>
                    <FormField label="Reason" hint="Optional.">
                      <input
                        className={inputClass}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Follow-up"
                      />
                    </FormField>

                    {bookError && <p className="text-sm text-destructive">{bookError}</p>}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={createFollowUp.isPending} size="sm">
                        {createFollowUp.isPending && (
                          <Spinner className="text-primary-foreground" />
                        )}
                        {!createFollowUp.isPending && <CalendarPlus className="size-4" />}
                        Book follow-up
                      </Button>
                    </div>
                  </form>
                </PermissionGate>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Upcoming appointments
                  </p>
                  {appointments.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : upcoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None scheduled.</p>
                  ) : (
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {upcoming.map((a) => (
                        <li key={a.id} className="p-2 text-sm text-foreground">
                          {formatDate(a.date)} · {a.timeLabel} · {a.doctorName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
