"use client";

import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useCreateUser, useRoles } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import { useUpdatePatientRecord } from "@/components/patients/queries";
import { FormField, inputClass, textareaClass } from "@/components/settings/form-field";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";

function emptyState() {
  return {
    name: "",
    mobile: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    address: "",
  };
}

/**
 * New Patient dialog — wired to the existing admin user-creation endpoint
 * (POST /api/auth/users/, via usersApi.create()/useCreateUser(), the exact
 * same call create-user-dialog.tsx makes). No new endpoint, no duplicated
 * creation logic: the Patient role is looked up from the same useRoles()
 * catalog every other role picker in the panel already uses and passed as
 * roleId, so StaffProfileProvisioningService provisions the PatientRecord
 * server-side exactly like it does for Doctor.
 *
 * Password / Confirm password mirror reset-password-dialog.tsx's pattern:
 * match-checking is client-side only, and the server still runs its own
 * validate_password check via AdminCreateUserSerializer — this dialog does
 * not duplicate that validation, it only adds the "do these two fields
 * match" check a round-trip can't usefully do. There is no dialog role
 * selector — the Patient role is assigned automatically and silently.
 *
 * Field notes:
 * - Gender and Date of Birth mirror the required-select / type="date"
 *   patterns already used elsewhere (create-user-dialog.tsx's Role select;
 *   leave-manager-dialog.tsx's date inputs).
 * - Blood Group options are lifted from the existing
 *   medical_records.PatientRecord.BloodGroup choices (A+/A-/B+/B-/AB+/AB-/
 *   O+/O-) — the same vocabulary the backend already defines.
 * - Date of Birth is now sent as part of the create payload:
 *   AdminCreateUserSerializer accepts an optional date_of_birth field.
 * - Blood Group is not part of user creation (it lives on PatientRecord, a
 *   separate model/app). Once the user is created, if a blood group was
 *   selected, a second request — PATCH /api/records/patients/{id}/ via
 *   useUpdatePatientRecord() — sets it. That request failing does not fail
 *   patient creation; it only surfaces a warning toast, since the patient
 *   account already exists at that point.
 * - Emergency Contact Name/Number and Address are collected in this form but
 *   NOT sent anywhere yet: no backend field exists for emergency contact
 *   name/number as separate values or a structured address. Sending only
 *   what the endpoints actually support, rather than inventing payload
 *   fields.
 */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PATIENT_ROLE_NAME = "Patient";

export function CreatePatientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const create = useCreateUser();
  const updateRecord = useUpdatePatientRecord();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyState());
  const [error, setError] = useState<string | null>(null);

  const resetDeps = [open];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setForm(emptyState());
    setError(null);
  }

  if (!open) return null;

  function set<K extends keyof ReturnType<typeof emptyState>>(
    key: K,
    value: ReturnType<typeof emptyState>[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !form.name.trim() ||
      !form.mobile.trim() ||
      !form.email.trim() ||
      !form.gender ||
      !form.dateOfBirth
    ) {
      setError("Full name, mobile number, email, gender, and date of birth are required.");
      return;
    }
    if (!form.password || !form.confirmPassword) {
      setError("Enter and confirm a password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const patientRole = roles?.find((role) => role.name === PATIENT_ROLE_NAME);
    if (!patientRole) {
      setError("The Patient role is not available. Contact an administrator.");
      return;
    }

    try {
      const { user, profileMessages } = await create.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: patientRole.id,
        phone: form.mobile.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
      });
      qc.invalidateQueries({ queryKey: ["patients", "directory"] });
      toast.success(`${user.name} was created.`);
      for (const message of profileMessages) {
        toast.success(message);
      }

      if (form.bloodGroup && user.id !== undefined) {
        try {
          await updateRecord.mutateAsync({
            patientId: user.id,
            input: { bloodGroup: form.bloodGroup },
          });
        } catch {
          toast.warning(
            `${user.name} was created, but the blood group could not be saved. You can set it from the patient's record.`,
          );
        }
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create this patient.");
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

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto p-6 pr-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground">New patient</h2>
              <p className="text-sm text-muted-foreground">
                Add a patient&apos;s profile and contact details.
              </p>
            </div>

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
              <FormField label="Mobile number">
                <input
                  className={inputClass}
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  required
                  placeholder="+1 555 010 0100"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  placeholder="jane.doe@example.com"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gender">
                <select
                  className={inputClass}
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="Date of birth">
                <input
                  type="date"
                  className={inputClass}
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Password">
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter a password"
                />
              </FormField>
              <FormField label="Confirm password">
                <input
                  type="password"
                  className={inputClass}
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter the password"
                />
              </FormField>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Emergency contact name" hint="Optional.">
                <input
                  className={inputClass}
                  value={form.emergencyContactName}
                  onChange={(e) => set("emergencyContactName", e.target.value)}
                  placeholder="Contact's full name"
                />
              </FormField>
              <FormField label="Emergency contact number" hint="Optional.">
                <input
                  className={inputClass}
                  value={form.emergencyContactNumber}
                  onChange={(e) => set("emergencyContactNumber", e.target.value)}
                  placeholder="+1 555 010 0100"
                />
              </FormField>
            </div>

            <FormField label="Address" hint="Optional.">
              <textarea
                className={textareaClass}
                rows={3}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, city, state, postal code"
              />
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || updateRecord.isPending || rolesLoading}
            >
              {(create.isPending || updateRecord.isPending) && (
                <Spinner className="text-primary-foreground" />
              )}
              Create Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
