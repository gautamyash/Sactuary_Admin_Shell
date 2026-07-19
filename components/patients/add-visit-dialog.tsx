"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useCompleteAppointment, usePatientAppointments } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";

const ACTIVE_STATUSES = ["confirmed", "pending"];

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "Add Visit" for the Medical Visits card (Phase: Admin Medical Visit
 * Management). A MedicalVisit cannot be created from scratch — it has a
 * non-nullable OneToOneField to Appointment and is auto-created by an
 * existing backend signal the moment an appointment is completed. So this
 * dialog lists the patient's own active (confirmed/pending) appointments —
 * reusing the existing admin appointments list, scoped with the ?patient=
 * filter — and lets the admin complete one via the existing, already
 * appointment.edit-gated /api/appointments/{id}/complete/ endpoint. That
 * completion is what creates the visit; no new create endpoint exists or is
 * needed. Once created, use the Edit action on the new row to add
 * diagnosis/notes.
 */
export function AddVisitDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const appointments = usePatientAppointments(patientId);
  const completeAppointment = useCompleteAppointment(patientId);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actualMinutes, setActualMinutes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const eligible = useMemo(
    () => (appointments.data ?? []).filter((a) => ACTIVE_STATUSES.includes(a.status)),
    [appointments.data],
  );

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setActualMinutes("");
      setFormError(null);
    }
  }, [open, patientId]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (selectedId === null) {
      setFormError("Choose an appointment to complete.");
      return;
    }
    if (actualMinutes.trim() !== "" && Number.isNaN(Number(actualMinutes))) {
      setFormError("Actual duration must be a number.");
      return;
    }
    try {
      await completeAppointment.mutateAsync({
        appointmentId: selectedId,
        actualMinutes: actualMinutes.trim() === "" ? undefined : Number(actualMinutes),
      });
      toast.success("Appointment completed — visit added. Use Edit to add diagnosis and notes.");
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not complete this appointment.",
      );
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
            <h2 className="text-lg font-semibold text-foreground">Add Visit</h2>
            <p className="text-sm text-muted-foreground">
              Complete one of this patient&apos;s active appointments to create a visit.
            </p>
          </div>

          {appointments.isLoading ? (
            <LoadingScreen label="Loading appointments…" />
          ) : appointments.isError ? (
            <ErrorState error={appointments.error} onRetry={() => appointments.refetch()} />
          ) : eligible.length === 0 ? (
            <p className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
              This patient has no upcoming or pending appointments to complete. Book an
              appointment first, then come back here to complete it into a visit.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <ul className="divide-y divide-border rounded-lg border border-border">
                {eligible.map((a) => (
                  <li key={a.id}>
                    <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/40">
                      <input
                        type="radio"
                        name="appointment"
                        checked={selectedId === a.id}
                        onChange={() => setSelectedId(a.id)}
                        className="size-4"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(a.date)} · {a.timeLabel}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.doctorName} · {a.specialty} · {a.status}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>

              <FormField label="Actual duration (minutes)" hint="Optional.">
                <input
                  type="number"
                  value={actualMinutes}
                  onChange={(e) => setActualMinutes(e.target.value)}
                  className={inputClass}
                  placeholder="30"
                />
              </FormField>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={completeAppointment.isPending}>
                  {completeAppointment.isPending && (
                    <Spinner className="text-primary-foreground" />
                  )}
                  Complete &amp; add visit
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
