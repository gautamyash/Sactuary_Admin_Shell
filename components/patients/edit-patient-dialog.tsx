"use client";

import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useUpdateUser } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import {
  patientKeys,
  usePatientProfile,
  usePatientRecord,
  useUpdatePatientRecord,
} from "@/components/patients/queries";
import { FormField, inputClass, labelClass } from "@/components/settings/form-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SMOKING_STATUSES = ["never", "former", "current"];
const ALCOHOL_LEVELS = ["none", "occasional", "regular"];

function emptyState() {
  return {
    name: "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    isActive: true,
    bloodGroup: "",
    emergencyContact: "",
    heightCm: "",
    weightKg: "",
    smokingStatus: "",
    alcohol: "",
    pregnant: "",
  };
}

/**
 * Edit Patient dialog for the Patient Detail page. Mirrors
 * components/access/edit-user-dialog.tsx's hand-rolled fixed-overlay markup
 * and preload-on-open pattern, extended to also cover PatientRecord fields.
 *
 * User fields (name, mobile, gender, date of birth, active) and
 * PatientRecord fields (blood group, emergency contact, height, weight,
 * smoking status, alcohol, pregnancy) live on two different backend
 * resources, so saving issues exactly two requests:
 *  - PATCH /api/auth/users/{id}/ (useUpdateUser — the same hook/endpoint
 *    Access -> Users' Edit User dialog and Activate/Deactivate action use).
 *  - PATCH /api/records/patients/{id}/ (useUpdatePatientRecord).
 *
 * Both are attempted independently — a failure in one never rolls back or
 * blocks the other. Each half reports its own success/failure via a
 * separate toast, so it's always clear which part saved and which didn't,
 * rather than one ambiguous error.
 *
 * No role selector (a patient is only ever edited as a Patient) and no
 * Address field — no backend field exists yet for a structured address, so
 * per this phase's scope it's left out entirely rather than collected and
 * silently dropped.
 */
export function EditPatientDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = patientId ?? NaN;
  const profile = usePatientProfile(id);
  const record = usePatientRecord(id);
  const updateUser = useUpdateUser();
  const updateRecord = useUpdatePatientRecord();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyState());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && profile.data && record.data) {
      const { user } = profile.data;
      const rec = record.data;
      setForm({
        name: user.name,
        mobile: user.phone ?? "",
        gender: user.gender ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        isActive: user.isActive ?? true,
        bloodGroup: rec.bloodGroup ?? "",
        emergencyContact: rec.emergencyContact ?? "",
        heightCm:
          rec.heightCm !== null && rec.heightCm !== undefined ? String(rec.heightCm) : "",
        weightKg:
          rec.weightKg !== null && rec.weightKg !== undefined ? String(rec.weightKg) : "",
        smokingStatus: rec.smokingStatus ?? "",
        alcohol: rec.alcohol ?? "",
        pregnant:
          rec.pregnant === null || rec.pregnant === undefined ? "" : String(rec.pregnant),
      });
      setError(null);
    }
  }, [open, profile.data, record.data]);

  if (!open || patientId === null) return null;

  function set<K extends keyof ReturnType<typeof emptyState>>(
    key: K,
    value: ReturnType<typeof emptyState>[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    if (!name) {
      setError("Full name is required.");
      return;
    }
    if (form.heightCm.trim() !== "" && Number.isNaN(Number(form.heightCm))) {
      setError("Height must be a number.");
      return;
    }
    if (form.weightKg.trim() !== "" && Number.isNaN(Number(form.weightKg))) {
      setError("Weight must be a number.");
      return;
    }

    const targetId = patientId as number;
    let userOk = false;
    let userMessage = "";
    let recordOk = false;
    let recordMessage = "";

    try {
      await updateUser.mutateAsync({
        userId: targetId,
        input: {
          name,
          phone: form.mobile.trim(),
          gender: form.gender,
          isActive: form.isActive,
          ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        },
      });
      userOk = true;
    } catch (err) {
      userMessage =
        err instanceof ApiError ? err.message : "Could not update the patient's profile.";
    }

    try {
      await updateRecord.mutateAsync({
        patientId: targetId,
        input: {
          bloodGroup: form.bloodGroup,
          emergencyContact: form.emergencyContact.trim(),
          heightCm: form.heightCm.trim() === "" ? null : Number(form.heightCm),
          weightKg: form.weightKg.trim() === "" ? null : Number(form.weightKg),
          smokingStatus: form.smokingStatus,
          alcohol: form.alcohol,
          pregnant: form.pregnant === "" ? null : form.pregnant === "true",
        },
      });
      recordOk = true;
    } catch (err) {
      recordMessage =
        err instanceof ApiError
          ? err.message
          : "Could not update the patient's medical record.";
    }

    qc.invalidateQueries({ queryKey: ["patients", "directory"] });
    qc.invalidateQueries({ queryKey: patientKeys.profile(targetId) });

    if (userOk && recordOk) {
      toast.success(`${name} was updated.`);
      onOpenChange(false);
    } else if (userOk) {
      toast.success(`${name}'s profile was updated.`);
      toast.warning(`Medical record was not updated: ${recordMessage}`);
      onOpenChange(false);
    } else if (recordOk) {
      toast.success(`${name}'s medical record was updated.`);
      toast.warning(`Profile was not updated: ${userMessage}`);
      onOpenChange(false);
    } else {
      setError(userMessage || recordMessage || "Could not update this patient.");
    }
  }

  const loading =
    profile.isLoading ||
    record.isLoading ||
    (profile.data === undefined && !profile.isError) ||
    (record.data === undefined && !record.isError);
  const isError = profile.isError || record.isError;
  const saving = updateUser.isPending || updateRecord.isPending;

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

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : isError ? (
          <div className="space-y-4 p-6">
            <p className="text-sm text-destructive">Could not load this patient.</p>
            <Button
              variant="outline"
              onClick={() => {
                profile.refetch();
                record.refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-5 overflow-y-auto p-6 pr-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Edit patient</h2>
                <p className="text-sm text-muted-foreground">
                  Update {profile.data?.user.name}&apos;s profile and medical record.
                </p>
              </div>

              <FormField label="Email" hint="Email cannot be changed after creation.">
                <input
                  type="email"
                  className={inputClass}
                  value={profile.data?.user.email ?? ""}
                  disabled
                  readOnly
                />
              </FormField>

              <FormField label="Full name">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  placeholder="Jane Doe"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Mobile number" hint="Optional.">
                  <input
                    className={inputClass}
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                    placeholder="+1 555 010 0100"
                  />
                </FormField>
                <FormField label="Gender" hint="Optional.">
                  <select
                    className={inputClass}
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="">Unspecified</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Date of birth" hint="Optional.">
                <input
                  type="date"
                  className={inputClass}
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                />
              </FormField>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className={labelClass}>Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive accounts cannot sign in to the Admin Panel or mobile app.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground">Medical record</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Blood group" hint="Optional.">
                  <select
                    className={inputClass}
                    value={form.bloodGroup}
                    onChange={(e) => set("bloodGroup", e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Emergency contact" hint="Optional.">
                  <input
                    className={inputClass}
                    value={form.emergencyContact}
                    onChange={(e) => set("emergencyContact", e.target.value)}
                    placeholder="Contact name and number"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Height (cm)" hint="Optional.">
                  <input
                    type="number"
                    className={inputClass}
                    value={form.heightCm}
                    onChange={(e) => set("heightCm", e.target.value)}
                    placeholder="170"
                  />
                </FormField>
                <FormField label="Weight (kg)" hint="Optional.">
                  <input
                    type="number"
                    className={inputClass}
                    value={form.weightKg}
                    onChange={(e) => set("weightKg", e.target.value)}
                    placeholder="65"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Smoking status" hint="Optional.">
                  <select
                    className={inputClass}
                    value={form.smokingStatus}
                    onChange={(e) => set("smokingStatus", e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {SMOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Alcohol use" hint="Optional.">
                  <select
                    className={inputClass}
                    value={form.alcohol}
                    onChange={(e) => set("alcohol", e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {ALCOHOL_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Pregnancy" hint="Optional.">
                <select
                  className={inputClass}
                  value={form.pregnant}
                  onChange={(e) => set("pregnant", e.target.value)}
                >
                  <option value="">Not specified</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </FormField>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner className="text-primary-foreground" />}
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
