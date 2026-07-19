"use client";

import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useCreateMedication,
  useDeleteMedication,
  usePatientRecord,
  useUpdateMedication,
} from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { Medication } from "@/lib/api/records";

interface DraftState {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

function emptyDraft(): DraftState {
  return { name: "", dosage: "", frequency: "", startDate: "", endDate: "", active: true };
}

/** Mirrors AllergyManagerDialog / components/doctors/leave-manager-dialog.tsx's
 * list + inline add/edit form pattern, adapted for medications. Reads from
 * usePatientRecord(patientId) — medications are an embedded array on
 * PatientRecord, not a separate list endpoint — so this shares the same
 * cached data MedicationsCard, PatientProfileCard, and the Edit Patient
 * dialog already read, and every mutation invalidates that one query. */
export function MedicationManagerDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = patientId ?? NaN;
  const record = usePatientRecord(id);
  const createMedication = useCreateMedication(id);
  const updateMedication = useUpdateMedication(id);
  const deleteMedication = useDeleteMedication(id);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEditingId(null);
      setDraft(emptyDraft());
      setFormError(null);
    }
  }, [open, patientId]);

  if (!open || patientId === null) return null;

  function startEdit(row: Medication) {
    setEditingId(row.id);
    setDraft({
      name: row.name,
      dosage: row.dosage ?? "",
      frequency: row.frequency ?? "",
      startDate: row.startDate ?? "",
      endDate: row.endDate ?? "",
      active: row.active,
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const name = draft.name.trim();
    if (!name) {
      setFormError("Medication name is required.");
      return;
    }
    const input = {
      name,
      dosage: draft.dosage.trim(),
      frequency: draft.frequency.trim(),
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      active: draft.active,
    };
    try {
      if (editingId) {
        await updateMedication.mutateAsync({ medicationId: editingId, input });
        toast.success("Medication updated.");
      } else {
        await createMedication.mutateAsync(input);
        toast.success("Medication added.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this medication.");
    }
  }

  async function handleDelete(medicationId: number) {
    try {
      await deleteMedication.mutateAsync(medicationId);
      toast.success("Medication removed.");
      if (editingId === medicationId) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this medication.");
    }
  }

  const pending = createMedication.isPending || updateMedication.isPending;
  const medications = record.data?.medications ?? [];

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
            <h2 className="text-lg font-semibold text-foreground">Manage Medications</h2>
            <p className="text-sm text-muted-foreground">
              Current medications for this patient&apos;s record.
            </p>
          </div>

          {record.isLoading ? (
            <LoadingScreen label="Loading medications…" />
          ) : record.isError ? (
            <ErrorState error={record.error} onRetry={() => record.refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {medications.length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No medications recorded yet.
                </li>
              ) : (
                medications.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <Badge variant={row.active ? "success" : "secondary"}>
                          {row.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {(row.dosage || row.frequency) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[row.dosage, row.frequency].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
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
                        disabled={deleteMedication.isPending}
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm font-medium text-foreground">
              {editingId ? "Edit medication" : "Add a medication"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name" className="col-span-2 space-y-1">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Metformin"
                />
              </FormField>
              <FormField label="Dosage" className="space-y-1">
                <input
                  value={draft.dosage}
                  onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))}
                  className={inputClass}
                  placeholder="850mg"
                />
              </FormField>
              <FormField label="Frequency" className="space-y-1">
                <input
                  value={draft.frequency}
                  onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))}
                  className={inputClass}
                  placeholder="Twice daily"
                />
              </FormField>
              <FormField label="Start date" hint="Optional." className="space-y-1">
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
              <FormField label="End date" hint="Optional." className="space-y-1">
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
              <div className="col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-foreground">Currently active</span>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                  className="size-4 rounded border-border"
                />
              </div>
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
                {editingId ? "Save changes" : "Add medication"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
