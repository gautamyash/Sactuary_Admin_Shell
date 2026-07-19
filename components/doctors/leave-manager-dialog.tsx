"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useCreateLeave,
  useDeleteLeave,
  useDoctorLeaves,
  useUpdateLeave,
} from "@/components/doctors/queries";
import { formatDate } from "@/components/doctors/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DoctorLeave, DoctorLeaveStatus } from "@/lib/api/doctor-leaves";
import type { Doctor } from "@/lib/api/doctors";
import { ApiError } from "@/lib/api/errors";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring";

const STATUS_VARIANT: Record<DoctorLeaveStatus, BadgeVariant> = {
  approved: "success",
  pending: "warning",
  rejected: "destructive",
};

interface DraftState {
  startDate: string;
  endDate: string;
  reason: string;
  status: DoctorLeaveStatus;
}

function emptyDraft(): DraftState {
  return { startDate: "", endDate: "", reason: "", status: "pending" };
}

export function LeaveManagerDialog({
  doctor,
  open,
  onOpenChange,
}: {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const doctorId = doctor?.id ?? 0;
  const { data, isLoading, isError, error, refetch } = useDoctorLeaves(doctorId, open);
  const createLeave = useCreateLeave(doctorId);
  const updateLeave = useUpdateLeave(doctorId);
  const deleteLeave = useDeleteLeave(doctorId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);

  const resetDeps = [open, doctor?.id];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError(null);
  }

  if (!open || !doctor) return null;

  function startEdit(row: DoctorLeave) {
    setEditingId(row.id);
    setDraft({
      startDate: row.startDate,
      endDate: row.endDate,
      reason: row.reason,
      status: row.status,
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!draft.startDate || !draft.endDate) {
      setFormError("Start and end date are required.");
      return;
    }
    const input = {
      startDate: draft.startDate,
      endDate: draft.endDate,
      reason: draft.reason,
      // Only send status on edit — a new leave always starts pending
      // server-side, matching the existing self-service request workflow.
      ...(editingId ? { status: draft.status } : {}),
    };
    try {
      if (editingId) {
        await updateLeave.mutateAsync({ leaveId: editingId, input });
        toast.success("Leave record updated.");
      } else {
        await createLeave.mutateAsync(input);
        toast.success("Leave record added.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this leave record.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLeave.mutateAsync(id);
      toast.success("Leave record removed.");
      if (editingId === id) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this leave record.");
    }
  }

  const pending = createLeave.isPending || updateLeave.isPending;

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
            <h2 className="text-lg font-semibold text-foreground">Manage Leave</h2>
            <p className="text-sm text-muted-foreground">Leave records for {doctor.name}.</p>
          </div>

          {isLoading ? (
            <LoadingScreen label="Loading leave records…" />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {(data ?? []).length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No leave records yet.
                </li>
              ) : (
                data!.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(row.startDate)} – {formatDate(row.endDate)}
                        </p>
                        <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                      </div>
                      {row.reason && (
                        <p className="truncate text-xs text-muted-foreground">{row.reason}</p>
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
                        disabled={deleteLeave.isPending}
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
              {editingId ? "Edit leave record" : "Add a leave record"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                <input
                  value={draft.reason}
                  onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
                  className={inputClass}
                  placeholder="Conference attendance"
                />
              </div>
              {editingId && (
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, status: e.target.value as DoctorLeaveStatus }))
                    }
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
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
                {!editingId && <Plus className="size-4" />}
                {editingId ? "Save changes" : "Add leave"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
