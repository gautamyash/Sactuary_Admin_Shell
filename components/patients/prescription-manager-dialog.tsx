"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useCreatePrescription,
  useDeletePrescription,
  usePatientVisits,
  useUpdatePrescription,
} from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { FormField, inputClass, textareaClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { Prescription } from "@/lib/api/records";

interface DraftState {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

function emptyDraft(): DraftState {
  return { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" };
}

/**
 * "Prescriptions" manager for a single visit, opened from the Medical Visits
 * card (Phase: Admin Prescription Management). Mirrors
 * AllergyManagerDialog/LeaveManagerDialog's list + inline add/edit form
 * pattern.
 *
 * Prescriptions are not fetched separately here — they're already embedded
 * on each MedicalVisit (usePatientVisits(patientId), the same query
 * MedicalVisitsCard and PatientJourney already read from), so this dialog
 * takes a visitId and derives the current list by finding that visit in the
 * already-cached array. Every mutation invalidates patientKeys.visits and
 * patientKeys.timeline, so this list, the visit's own row, and the timeline
 * (which reads visit.prescriptions.all() directly) all stay in sync without
 * a dedicated prescriptions endpoint or query.
 *
 * Create reuses the existing VisitPrescriptionView
 * (POST /api/records/visits/{id}/prescriptions/); edit/delete use the new
 * PrescriptionDetailView (PATCH/DELETE /api/records/prescriptions/{id}/),
 * both gated server-side on "emr.prescription" — viewing the list itself
 * requires no extra gate beyond the page's emr.view, but the add/edit/delete
 * controls are gated here to match.
 */
export function PrescriptionManagerDialog({
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
  const createPrescription = useCreatePrescription(patientId);
  const updatePrescription = useUpdatePrescription(patientId);
  const deletePrescription = useDeletePrescription(patientId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);

  const resetDeps = [open, visitId];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError(null);
  }

  if (!open || visitId === null) return null;

  const visit = visits.data?.find((v) => v.id === visitId) ?? null;
  const prescriptions = visit?.prescriptions ?? [];

  function startEdit(row: Prescription) {
    setEditingId(row.id);
    setDraft({
      medicine: row.medicine,
      dosage: row.dosage ?? "",
      frequency: row.frequency ?? "",
      duration: row.duration ?? "",
      instructions: row.instructions ?? "",
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const medicine = draft.medicine.trim();
    if (!medicine) {
      setFormError("Medicine name is required.");
      return;
    }
    const input = {
      medicine,
      dosage: draft.dosage.trim(),
      frequency: draft.frequency.trim(),
      duration: draft.duration.trim(),
      instructions: draft.instructions.trim(),
    };
    try {
      if (editingId) {
        await updatePrescription.mutateAsync({ prescriptionId: editingId, input });
        toast.success("Prescription updated.");
      } else {
        await createPrescription.mutateAsync({ visitId: visitId!, input });
        toast.success("Prescription added.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this prescription.");
    }
  }

  async function handleDelete(prescriptionId: number) {
    try {
      await deletePrescription.mutateAsync(prescriptionId);
      toast.success("Prescription removed.");
      if (editingId === prescriptionId) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this prescription.");
    }
  }

  const pending = createPrescription.isPending || updatePrescription.isPending;

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
            <h2 className="text-lg font-semibold text-foreground">Prescriptions</h2>
            {visit && (
              <p className="text-sm text-muted-foreground">
                {visit.doctorName} · {visit.specialty}
              </p>
            )}
          </div>

          {visits.isLoading ? (
            <LoadingScreen label="Loading prescriptions…" />
          ) : visits.isError ? (
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {prescriptions.length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No prescriptions recorded for this visit yet.
                </li>
              ) : (
                prescriptions.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{row.medicine}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[row.dosage, row.frequency, row.duration].filter(Boolean).join(" · ") ||
                          "No dosage details"}
                      </p>
                      {row.instructions && (
                        <p className="truncate text-xs text-muted-foreground">
                          {row.instructions}
                        </p>
                      )}
                    </div>
                    <PermissionGate permission="emr.prescription">
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEdit(row)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={deletePrescription.isPending}
                          onClick={() => handleDelete(row.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </PermissionGate>
                  </li>
                ))
              )}
            </ul>
          )}

          <PermissionGate permission="emr.prescription">
            <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground">
                {editingId ? "Edit prescription" : "Add a prescription"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Medicine" className="col-span-2 space-y-1">
                  <input
                    value={draft.medicine}
                    onChange={(e) => setDraft((d) => ({ ...d, medicine: e.target.value }))}
                    className={inputClass}
                    placeholder="Amoxicillin"
                  />
                </FormField>
                <FormField label="Dosage" className="space-y-1">
                  <input
                    value={draft.dosage}
                    onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))}
                    className={inputClass}
                    placeholder="500mg"
                  />
                </FormField>
                <FormField label="Frequency" className="space-y-1">
                  <input
                    value={draft.frequency}
                    onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))}
                    className={inputClass}
                    placeholder="3x daily"
                  />
                </FormField>
                <FormField label="Duration" className="col-span-2 space-y-1">
                  <input
                    value={draft.duration}
                    onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
                    className={inputClass}
                    placeholder="7 days"
                  />
                </FormField>
                <FormField label="Instructions" className="col-span-2 space-y-1">
                  <textarea
                    value={draft.instructions}
                    onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))}
                    className={textareaClass}
                    rows={2}
                    placeholder="Take with food"
                  />
                </FormField>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setDraft(emptyDraft());
                    }}
                  >
                    Cancel edit
                  </Button>
                )}
                <Button type="submit" disabled={pending}>
                  {pending && <Spinner className="text-primary-foreground" />}
                  {!editingId && !pending && <Plus className="size-4" />}
                  {editingId ? "Save changes" : "Add prescription"}
                </Button>
              </div>
            </form>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
