"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { usePatientVisits, useUpdateVisitNotes } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { FormField, inputClass, textareaClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";

function emptyState() {
  return { chiefComplaint: "", diagnosis: "", clinicalNotes: "", followUpDate: "" };
}

/**
 * "Clinical Notes" manager for a single visit, opened from the Medical
 * Visits card (Phase: Admin Diagnosis & Care Plan). Reuses the existing
 * VisitNotesView endpoint (POST /api/records/visits/{id}/notes/, gated
 * "emr.edit") via useUpdateVisitNotes — no new backend endpoint, since that
 * view already accepts every field this section needs. This is a rename/
 * re-scope of what used to be the generic "Edit visit" pencil action: that
 * dialog already only ever touched chief_complaint/diagnosis/clinical_notes/
 * follow_up_date (date, doctor, and status are all appointment-derived and
 * read-only), so it was already exactly this feature, just not visually
 * separated from — or named distinctly from — Prescriptions/Lab Reports/
 * Vital Signs. Those three are untouched by this phase.
 *
 * Only chief complaint / diagnosis / clinical notes / follow-up date are
 * shown — the only fields that exist on MedicalVisit and are accepted by
 * DoctorNotesSerializer. There is no "Assessment" field anywhere on this
 * model (or any other clinical-documentation field beyond these four), so
 * it is not shown or invented here.
 *
 * Like VitalSignsManagerDialog, this is a singleton edit (one set of
 * documentation per visit, not a list) — the form itself, pre-filled with
 * the visit's current values, doubles as the "view" and the editor. Visits
 * aren't fetched separately here either — they're already embedded in
 * usePatientVisits(patientId), the same query MedicalVisitsCard/
 * PatientJourney/the other three visit-scoped dialogs already read from, so
 * this dialog takes a visitId and derives the current visit from that
 * already-cached array.
 */
export function ClinicalNotesDialog({
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
  const updateVisitNotes = useUpdateVisitNotes(patientId);

  const [form, setForm] = useState(emptyState());
  const [error, setError] = useState<string | null>(null);

  const resetDeps = [open, visitId, visits.data];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    if (visits.data) {
      const v = visits.data.find((vv) => vv.id === visitId) ?? null;
      setForm({
        chiefComplaint: v?.chiefComplaint ?? "",
        diagnosis: v?.diagnosis ?? "",
        clinicalNotes: v?.clinicalNotes ?? "",
        followUpDate: v?.followUpDate ?? "",
      });
      setError(null);
    }
  }

  if (!open || visitId === null) return null;

  const visit = visits.data?.find((v) => v.id === visitId) ?? null;

  function set<K extends keyof ReturnType<typeof emptyState>>(
    key: K,
    value: ReturnType<typeof emptyState>[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateVisitNotes.mutateAsync({
        visitId: visitId!,
        input: {
          chiefComplaint: form.chiefComplaint,
          diagnosis: form.diagnosis,
          clinicalNotes: form.clinicalNotes,
          followUpDate: form.followUpDate || null,
        },
      });
      toast.success("Clinical notes updated.");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update clinical notes.");
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

        {visits.isLoading ? (
          <div className="p-16">
            <LoadingScreen label="Loading clinical notes…" />
          </div>
        ) : visits.isError ? (
          <div className="space-y-4 p-6">
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-4 overflow-y-auto p-6 pr-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Clinical Notes</h2>
                {visit && (
                  <p className="text-sm text-muted-foreground">
                    {visit.doctorName} · {visit.specialty}
                  </p>
                )}
              </div>

              <FormField label="Chief complaint" hint="Optional.">
                <input
                  className={inputClass}
                  value={form.chiefComplaint}
                  onChange={(e) => set("chiefComplaint", e.target.value)}
                  placeholder="Reason for visit"
                />
              </FormField>

              <FormField label="Diagnosis" hint="Optional.">
                <input
                  className={inputClass}
                  value={form.diagnosis}
                  onChange={(e) => set("diagnosis", e.target.value)}
                  placeholder="Diagnosis"
                />
              </FormField>

              <FormField label="Clinical notes" hint="Optional.">
                <textarea
                  className={textareaClass}
                  rows={4}
                  value={form.clinicalNotes}
                  onChange={(e) => set("clinicalNotes", e.target.value)}
                  placeholder="Internal documentation"
                />
              </FormField>

              <FormField label="Follow-up date" hint="Optional.">
                <input
                  type="date"
                  className={inputClass}
                  value={form.followUpDate}
                  onChange={(e) => set("followUpDate", e.target.value)}
                />
              </FormField>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateVisitNotes.isPending}>
                {updateVisitNotes.isPending && <Spinner className="text-primary-foreground" />}
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
