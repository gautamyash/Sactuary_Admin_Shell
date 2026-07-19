"use client";

import { CalendarPlus, Search, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useCreateAppointment, useDoctorOptions } from "@/components/appointments/queries";
import { usePatients } from "@/components/patients/queries";
import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { Spinner } from "@/components/common/spinner";
import { ApiError } from "@/lib/api/errors";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

/**
 * General-purpose "New Appointment" dialog — books an appointment for any
 * patient (Phase: Export Report & New Appointment actions). Reuses the exact
 * same admin booking engine FollowUpCarePlanDialog's booking section already
 * uses (appointmentsApi.create / useCreateAppointment -> AdminAppointmentListView
 * POST -> AppointmentSerializer + BookingService.book()), just with a patient
 * picker instead of a fixed patientId, and the same patient-directory search
 * (usePatients) the Patients table already uses. No new endpoint, no new
 * booking logic — only a new entry point onto the existing flow.
 */
export function NewAppointmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const patients = usePatients(patientSearch.trim() || undefined);
  const doctors = useDoctorOptions();
  const createAppointment = useCreateAppointment();

  const resetDeps = [open];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setPatientSearch("");
    setPatientId("");
    setDoctorId("");
    setDate(todayISO());
    setTime("");
    setReason("");
    setError(null);
  }

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patientId) {
      setError("Choose a patient.");
      return;
    }
    if (!doctorId) {
      setError("Choose a doctor.");
      return;
    }
    if (!date) {
      setError("Choose a date.");
      return;
    }
    if (!time) {
      setError("Choose a time.");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        date,
        time,
        reason: reason.trim() || undefined,
      });
      toast.success("Appointment booked.");
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That slot was just booked by someone else. Choose another time.");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not book this appointment.");
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
            <h2 className="text-lg font-semibold text-foreground">New Appointment</h2>
            <p className="text-sm text-muted-foreground">Book a slot on behalf of a patient.</p>
          </div>

          <PermissionGate permission="appointment.create">
            <form onSubmit={submit} className="space-y-3">
              <FormField label="Patient">
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patients by name or email…"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <select
                  className={inputClass}
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  <option value="">
                    {patients.isLoading ? "Loading patients…" : "Choose a patient"}
                  </option>
                  {(patients.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.email}
                    </option>
                  ))}
                </select>
              </FormField>

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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </FormField>
                <FormField label="Time">
                  <input
                    type="time"
                    className={inputClass}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Reason" hint="Optional.">
                <input
                  className={inputClass}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for visit"
                />
              </FormField>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppointment.isPending}>
                  {createAppointment.isPending && <Spinner className="text-primary-foreground" />}
                  {!createAppointment.isPending && <CalendarPlus className="size-4" />}
                  Book appointment
                </Button>
              </div>
            </form>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
