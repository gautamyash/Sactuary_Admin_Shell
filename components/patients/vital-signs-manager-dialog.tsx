"use client";

import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { usePatientVisits, useUpdateVitals } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { VitalSigns } from "@/lib/api/records";

interface DraftState {
  bloodPressure: string;
  pulse: string;
  temperature: string;
  respiration: string;
  oxygen: string;
  bloodSugar: string;
  weight: string;
  height: string;
}

function numToStr(n: number | null | undefined): string {
  return n === null || n === undefined ? "" : String(n);
}

function draftFrom(v: VitalSigns | null | undefined): DraftState {
  return {
    bloodPressure: v?.bloodPressure ?? "",
    pulse: numToStr(v?.pulse),
    temperature: numToStr(v?.temperature),
    respiration: numToStr(v?.respiration),
    oxygen: numToStr(v?.oxygen),
    bloodSugar: numToStr(v?.bloodSugar),
    weight: numToStr(v?.weight),
    height: numToStr(v?.height),
  };
}

/**
 * "Vital Signs" manager for a single visit, opened from the Medical Visits
 * card (Phase: Admin Vital Signs Management). Reuses the same fixed-overlay
 * dialog chrome as PrescriptionManagerDialog/LabReportManagerDialog, but its
 * form is a singleton edit rather than a list + add/edit toggle: VitalSigns
 * has a OneToOneField to MedicalVisit (at most one row per visit, no
 * siblings), so there is nothing to list, add as a new entry, or delete —
 * only one record to view and edit, mirroring EditPatientDialog's
 * single-resource preload/save pattern instead.
 *
 * Vitals aren't fetched separately — like prescriptions/reports, they're
 * already embedded on each MedicalVisit (usePatientVisits(patientId), the
 * same query MedicalVisitsCard/PatientJourney already read from), so this
 * dialog derives the current values by finding that visit in the
 * already-cached array. `visit.vitals` may be null (no row has ever been
 * created for this visit, since nothing auto-creates one) — the form simply
 * starts blank in that case.
 *
 * Save always calls the same PATCH /api/records/visits/{id}/vitals/
 * (useUpdateVitals) regardless of whether a row already exists — the backend
 * get_or_creates it server-side, so this one form covers both "Create" and
 * "Edit" without a separate create action, matching VitalSigns' one-to-one,
 * not-auto-created nature. There is no Delete: every field is nullable, so
 * clearing a value is already possible by blanking it and saving — a
 * separate delete would only remove the row itself, which isn't a distinct
 * capability this phase calls for.
 *
 * No BMI field: it doesn't exist on VitalSigns at all (BMI is only a derived
 * property on the unrelated, patient-level PatientRecord model) — not shown
 * or invented here.
 */
export function VitalSignsManagerDialog({
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
  const updateVitals = useUpdateVitals(patientId);

  const [draft, setDraft] = useState<DraftState>(draftFrom(null));
  const [formError, setFormError] = useState<string | null>(null);

  const visit = visits.data?.find((v) => v.id === visitId) ?? null;

  useEffect(() => {
    if (open && visits.data) {
      const v = visits.data.find((vv) => vv.id === visitId) ?? null;
      setDraft(draftFrom(v?.vitals));
      setFormError(null);
    }
  }, [open, visitId, visits.data]);

  if (!open || visitId === null) return null;

  function set<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toNumberOrNull(raw: string): number | null {
    return raw.trim() === "" ? null : Number(raw);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const numericFields: Array<[string, string]> = [
      ["Pulse", draft.pulse],
      ["Temperature", draft.temperature],
      ["Respiratory rate", draft.respiration],
      ["Oxygen saturation", draft.oxygen],
      ["Blood sugar", draft.bloodSugar],
      ["Weight", draft.weight],
      ["Height", draft.height],
    ];
    for (const [label, raw] of numericFields) {
      if (raw.trim() !== "" && Number.isNaN(Number(raw))) {
        setFormError(`${label} must be a number.`);
        return;
      }
    }
    try {
      await updateVitals.mutateAsync({
        visitId: visitId!,
        input: {
          bloodPressure: draft.bloodPressure.trim(),
          pulse: toNumberOrNull(draft.pulse),
          temperature: toNumberOrNull(draft.temperature),
          respiration: toNumberOrNull(draft.respiration),
          oxygen: toNumberOrNull(draft.oxygen),
          bloodSugar: toNumberOrNull(draft.bloodSugar),
          weight: toNumberOrNull(draft.weight),
          height: toNumberOrNull(draft.height),
        },
      });
      toast.success("Vital signs updated.");
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save vital signs.");
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
            <h2 className="text-lg font-semibold text-foreground">Vital Signs</h2>
            {visit && (
              <p className="text-sm text-muted-foreground">
                {visit.doctorName} · {visit.specialty}
              </p>
            )}
          </div>

          {visits.isLoading ? (
            <LoadingScreen label="Loading vital signs…" />
          ) : visits.isError ? (
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          ) : (
            <PermissionGate permission="emr.edit">
              <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Blood pressure" hint="e.g. 120/80" className="space-y-1">
                    <input
                      value={draft.bloodPressure}
                      onChange={(e) => set("bloodPressure", e.target.value)}
                      className={inputClass}
                      placeholder="120/80"
                    />
                  </FormField>
                  <FormField label="Pulse (bpm)" className="space-y-1">
                    <input
                      value={draft.pulse}
                      onChange={(e) => set("pulse", e.target.value)}
                      className={inputClass}
                      placeholder="72"
                    />
                  </FormField>
                  <FormField label="Temperature (°C)" className="space-y-1">
                    <input
                      value={draft.temperature}
                      onChange={(e) => set("temperature", e.target.value)}
                      className={inputClass}
                      placeholder="37.0"
                    />
                  </FormField>
                  <FormField label="Respiratory rate" className="space-y-1">
                    <input
                      value={draft.respiration}
                      onChange={(e) => set("respiration", e.target.value)}
                      className={inputClass}
                      placeholder="16"
                    />
                  </FormField>
                  <FormField label="Oxygen saturation (%)" className="space-y-1">
                    <input
                      value={draft.oxygen}
                      onChange={(e) => set("oxygen", e.target.value)}
                      className={inputClass}
                      placeholder="98"
                    />
                  </FormField>
                  <FormField label="Blood sugar (mg/dL)" className="space-y-1">
                    <input
                      value={draft.bloodSugar}
                      onChange={(e) => set("bloodSugar", e.target.value)}
                      className={inputClass}
                      placeholder="90"
                    />
                  </FormField>
                  <FormField label="Weight (kg)" className="space-y-1">
                    <input
                      value={draft.weight}
                      onChange={(e) => set("weight", e.target.value)}
                      className={inputClass}
                      placeholder="70"
                    />
                  </FormField>
                  <FormField label="Height (cm)" className="space-y-1">
                    <input
                      value={draft.height}
                      onChange={(e) => set("height", e.target.value)}
                      className={inputClass}
                      placeholder="175"
                    />
                  </FormField>
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={updateVitals.isPending}>
                    {updateVitals.isPending && <Spinner className="text-primary-foreground" />}
                    Save vital signs
                  </Button>
                </div>
              </form>
            </PermissionGate>
          )}
        </div>
      </div>
    </div>
  );
}
