"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useCreateAllergy,
  useDeleteAllergy,
  usePatientRecord,
  useUpdateAllergy,
} from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, inputClass, textareaClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { Allergy } from "@/lib/api/records";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "LIFE_THREATENING"] as const;

const SEVERITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  LIFE_THREATENING: "Life-threatening",
};

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  LOW: "secondary",
  MEDIUM: "warning",
  HIGH: "destructive",
  LIFE_THREATENING: "destructive",
};

interface DraftState {
  name: string;
  severity: string;
  notes: string;
}

function emptyDraft(): DraftState {
  return { name: "", severity: "LOW", notes: "" };
}

/** Mirrors components/doctors/leave-manager-dialog.tsx's list + inline
 * add/edit form pattern, adapted for allergies. The list itself comes from
 * usePatientRecord(patientId) — allergies are an embedded array on
 * PatientRecord, not a separate list endpoint — so this dialog shares the
 * same cached data AllergiesCard, PatientProfileCard, and the Edit Patient
 * dialog all already read, and every mutation invalidates that one query. */
export function AllergyManagerDialog({
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
  const createAllergy = useCreateAllergy(id);
  const updateAllergy = useUpdateAllergy(id);
  const deleteAllergy = useDeleteAllergy(id);

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

  function startEdit(row: Allergy) {
    setEditingId(row.id);
    setDraft({ name: row.name, severity: row.severity, notes: row.notes ?? "" });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const name = draft.name.trim();
    if (!name) {
      setFormError("Allergy name is required.");
      return;
    }
    const input = { name, severity: draft.severity, notes: draft.notes.trim() };
    try {
      if (editingId) {
        await updateAllergy.mutateAsync({ allergyId: editingId, input });
        toast.success("Allergy updated.");
      } else {
        await createAllergy.mutateAsync(input);
        toast.success("Allergy added.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this allergy.");
    }
  }

  async function handleDelete(allergyId: number) {
    try {
      await deleteAllergy.mutateAsync(allergyId);
      toast.success("Allergy removed.");
      if (editingId === allergyId) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this allergy.");
    }
  }

  const pending = createAllergy.isPending || updateAllergy.isPending;
  const allergies = record.data?.allergies ?? [];

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
            <h2 className="text-lg font-semibold text-foreground">Manage Allergies</h2>
            <p className="text-sm text-muted-foreground">
              Known allergies for this patient&apos;s record.
            </p>
          </div>

          {record.isLoading ? (
            <LoadingScreen label="Loading allergies…" />
          ) : record.isError ? (
            <ErrorState error={record.error} onRetry={() => record.refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {allergies.length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No known allergies yet.
                </li>
              ) : (
                allergies.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <Badge variant={SEVERITY_VARIANT[row.severity] ?? "secondary"}>
                          {SEVERITY_LABEL[row.severity] ?? row.severity}
                        </Badge>
                      </div>
                      {row.notes && (
                        <p className="truncate text-xs text-muted-foreground">{row.notes}</p>
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
                        disabled={deleteAllergy.isPending}
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
              {editingId ? "Edit allergy" : "Add an allergy"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name" className="col-span-2 space-y-1">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Penicillin"
                />
              </FormField>
              <FormField label="Severity" className="space-y-1">
                <select
                  value={draft.severity}
                  onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}
                  className={inputClass}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {SEVERITY_LABEL[s]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Notes" className="col-span-2 space-y-1">
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  className={textareaClass}
                  rows={2}
                  placeholder="Optional notes"
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
                {editingId ? "Save changes" : "Add allergy"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
