"use client";

import { Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useDeleteReport,
  usePatientVisits,
  useUpdateReport,
  useUploadReport,
} from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/settings/form-field";
import { ApiError } from "@/lib/api/errors";
import type { LabReport } from "@/lib/api/records";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "Lab Reports" manager for a single visit, opened from the Medical Visits
 * card (Phase: Admin Lab Report Management). Mirrors
 * PrescriptionManagerDialog's list + inline add/edit form pattern.
 *
 * Reports are not fetched separately — they're already embedded on each
 * MedicalVisit (usePatientVisits(patientId), the same query
 * MedicalVisitsCard/PrescriptionManagerDialog/PatientJourney already read
 * from), so this dialog takes a visitId and derives the current list by
 * finding that visit in the already-cached array. Every mutation invalidates
 * patientKeys.visits and patientKeys.timeline, so this list, the visit's own
 * row, and the timeline all stay in sync.
 *
 * Unlike Allergies/Medications/Prescriptions, a LabReport only has
 * title/file/uploaded_at as real fields — there is no test_name, status,
 * ordered_date, result_date, or summary anywhere in the backend schema, so
 * none of those are shown or invented here. "Test Name" below is the
 * existing `title` field under a clearer label; "Uploaded" is the existing
 * `uploadedAt` timestamp — the only date the backend has.
 *
 * Add and Edit also use different backend permissions (upload vs. edit vs.
 * delete are three distinct RBAC codes here, not one shared code like
 * Prescription's), so this dialog gates each action independently rather
 * than wrapping one shared PermissionGate around the whole form the way the
 * other manager dialogs do. Add also requires a file (create is a multipart
 * upload); Edit is title-only, since that is the only writable field the
 * backend's edit endpoint exposes — no file replacement is offered.
 */
export function LabReportManagerDialog({
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
  const uploadReport = useUploadReport(patientId);
  const updateReport = useUpdateReport(patientId);
  const deleteReport = useDeleteReport(patientId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDeps = [open, visitId];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setEditingId(null);
    setTitle("");
    setFile(null);
    setFormError(null);
  }

  if (!open || visitId === null) return null;

  const visit = visits.data?.find((v) => v.id === visitId) ?? null;
  const reports = visit?.reports ?? [];

  function startEdit(row: LabReport) {
    setEditingId(row.id);
    setTitle(row.title);
    setFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setFile(null);
    setFormError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError("Test name is required.");
      return;
    }
    try {
      if (editingId) {
        await updateReport.mutateAsync({ reportId: editingId, input: { title: trimmed } });
        toast.success("Lab report updated.");
      } else {
        if (!file) {
          setFormError("Choose a file to upload.");
          return;
        }
        await uploadReport.mutateAsync({ visitId: visitId!, input: { title: trimmed, file } });
        toast.success("Lab report uploaded.");
      }
      cancelEdit();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this lab report.");
    }
  }

  async function handleDelete(reportId: number) {
    try {
      await deleteReport.mutateAsync(reportId);
      toast.success("Lab report removed.");
      if (editingId === reportId) cancelEdit();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this lab report.");
    }
  }

  const pending = uploadReport.isPending || updateReport.isPending;

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
            <h2 className="text-lg font-semibold text-foreground">Lab Reports</h2>
            {visit && (
              <p className="text-sm text-muted-foreground">
                {visit.doctorName} · {visit.specialty}
              </p>
            )}
          </div>

          {visits.isLoading ? (
            <LoadingScreen label="Loading lab reports…" />
          ) : visits.isError ? (
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {reports.length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No lab reports uploaded for this visit yet.
                </li>
              ) : (
                reports.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDateTime(row.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {row.fileUrl && (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="View file"
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <Download className="size-4" />
                        </a>
                      )}
                      <PermissionGate permission="emr.edit">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEdit(row)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <Pencil className="size-4" />
                        </button>
                      </PermissionGate>
                      <PermissionGate permission="emr.delete">
                        <button
                          type="button"
                          title="Delete"
                          disabled={deleteReport.isPending}
                          onClick={() => handleDelete(row.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          <PermissionGate permission={editingId ? "emr.edit" : "emr.upload"}>
            <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground">
                {editingId ? "Edit lab report" : "Upload a lab report"}
              </p>
              <FormField label="Test name" className="space-y-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Blood panel"
                />
              </FormField>

              {editingId ? (
                <p className="text-xs text-muted-foreground">
                  The file itself can&apos;t be replaced here — only the test name.
                </p>
              ) : (
                <FormField label="File" hint="PDF, JPG, or PNG, up to 10 MB.">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className={inputClass}
                  />
                </FormField>
              )}

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel edit
                  </Button>
                )}
                <Button type="submit" disabled={pending}>
                  {pending && <Spinner className="text-primary-foreground" />}
                  {!editingId && !pending && <Plus className="size-4" />}
                  {editingId ? "Save changes" : "Upload report"}
                </Button>
              </div>
            </form>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
