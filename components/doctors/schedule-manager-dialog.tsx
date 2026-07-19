"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useCreateSchedule,
  useDeleteSchedule,
  useDoctorSchedules,
  useUpdateSchedule,
} from "@/components/doctors/queries";
import { formatTime, WEEKDAY_OPTIONS, weekdayLabel } from "@/components/doctors/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/lib/api/doctors";
import type { DoctorSchedule } from "@/lib/api/doctor-schedules";
import { ApiError } from "@/lib/api/errors";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring";

interface DraftState {
  weekday: string;
  startTime: string;
  endTime: string;
  slotMinutes: string;
}

function emptyDraft(): DraftState {
  return { weekday: "0", startTime: "09:00", endTime: "17:00", slotMinutes: "30" };
}

export function ScheduleManagerDialog({
  doctor,
  open,
  onOpenChange,
}: {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const doctorId = doctor?.id ?? 0;
  const { data, isLoading, isError, error, refetch } = useDoctorSchedules(doctorId, open);
  const createSchedule = useCreateSchedule(doctorId);
  const updateSchedule = useUpdateSchedule(doctorId);
  const deleteSchedule = useDeleteSchedule(doctorId);

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

  function startEdit(row: DoctorSchedule) {
    setEditingId(row.id);
    setDraft({
      weekday: String(row.weekday),
      startTime: row.startTime.slice(0, 5),
      endTime: row.endTime.slice(0, 5),
      slotMinutes: String(row.slotMinutes),
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!draft.startTime || !draft.endTime) {
      setFormError("Start and end time are required.");
      return;
    }
    const input = {
      weekday: Number(draft.weekday),
      startTime: draft.startTime,
      endTime: draft.endTime,
      slotMinutes: Number(draft.slotMinutes) || 30,
    };
    try {
      if (editingId) {
        await updateSchedule.mutateAsync({ scheduleId: editingId, input });
        toast.success("Schedule block updated.");
      } else {
        await createSchedule.mutateAsync(input);
        toast.success("Schedule block added.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this schedule block.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteSchedule.mutateAsync(id);
      toast.success("Schedule block removed.");
      if (editingId === id) {
        setEditingId(null);
        setDraft(emptyDraft());
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove this schedule block.");
    }
  }

  const pending = createSchedule.isPending || updateSchedule.isPending;

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
            <h2 className="text-lg font-semibold text-foreground">Manage Schedule</h2>
            <p className="text-sm text-muted-foreground">
              Weekly working-hour blocks for {doctor.name}.
            </p>
          </div>

          {isLoading ? (
            <LoadingScreen label="Loading schedule…" />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <ul className="mb-5 divide-y divide-border rounded-lg border border-border">
              {(data ?? []).length === 0 ? (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No schedule blocks yet.
                </li>
              ) : (
                data!.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {weekdayLabel(row.weekday)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(row.startTime)} – {formatTime(row.endTime)} ·{" "}
                        {row.slotMinutes}min slots
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
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
                        disabled={deleteSchedule.isPending}
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
              {editingId ? "Edit block" : "Add a block"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Day</label>
                <select
                  value={draft.weekday}
                  onChange={(e) => setDraft((d) => ({ ...d, weekday: e.target.value }))}
                  className={inputClass}
                >
                  {WEEKDAY_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start</label>
                <input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End</label>
                <input
                  type="time"
                  value={draft.endTime}
                  onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Slot length (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={draft.slotMinutes}
                  onChange={(e) => setDraft((d) => ({ ...d, slotMinutes: e.target.value }))}
                  className={inputClass}
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
                {!editingId && <Plus className="size-4" />}
                {editingId ? "Save changes" : "Add block"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
