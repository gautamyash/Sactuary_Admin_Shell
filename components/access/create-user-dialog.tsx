"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useCreateUser, useRoles } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import { FormField, inputClass, labelClass } from "@/components/settings/form-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";

function emptyState() {
  return {
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    roleId: "",
    isActive: true,
  };
}

/**
 * New User dialog for Access → Users. Hand-rolled fixed-overlay markup,
 * matching the existing assign-role-dialog.tsx / doctor-form-dialog.tsx
 * pattern (no shadcn Dialog primitive in this codebase) rather than
 * introducing a new one. Shares components/settings/form-field.tsx's
 * inputClass/labelClass/FormField, the same styling every other hand-rolled
 * form in the panel already uses.
 *
 * POST /api/auth/users/ creates the account (existing auth flow's password
 * hashing) and assigns the selected role in the same request — no separate
 * "assign role" follow-up call needed for a brand-new user.
 */
export function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const create = useCreateUser();
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

    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email || !form.password || form.roleId === "") {
      setError("Full name, email, temporary password, and role are required.");
      return;
    }

    try {
      const { user, profileMessages } = await create.mutateAsync({
        name,
        email,
        password: form.password,
        roleId: Number(form.roleId),
        phone: form.phone.trim(),
        gender: form.gender,
        isActive: form.isActive,
      });
      toast.success(`${user.name} was created.`);
      // Automatic Staff Profile Linking: announce any linked hospital
      // profile StaffProfileProvisioningService created for this role
      // (e.g. "Doctor profile created"). Silent for roles with no linked
      // profile (profileMessages is empty in that case).
      for (const message of profileMessages) {
        toast.success(message);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create this user.");
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
              <h2 className="text-lg font-semibold text-foreground">New user</h2>
              <p className="text-sm text-muted-foreground">
                Create a staff or patient account and assign its role in one step.
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

            <FormField label="Email" hint="Must be unique — this is the login identifier.">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                placeholder="jane.doe@example.com"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone" hint="Optional.">
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
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

            <FormField
              label="Temporary password"
              hint="The user can change this after signing in."
            >
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Enter a temporary password"
              />
            </FormField>

            <FormField label="Role">
              <select
                className={inputClass}
                value={form.roleId}
                onChange={(e) => set("roleId", e.target.value)}
                required
                disabled={rolesLoading}
              >
                <option value="" disabled>
                  {rolesLoading ? "Loading roles…" : "Select a role"}
                </option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className={labelClass}>Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive accounts cannot sign in until reactivated.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => set("isActive", checked)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner className="text-primary-foreground" />}
              Create user
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
