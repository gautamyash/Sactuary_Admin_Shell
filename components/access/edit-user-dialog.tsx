"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useRoles, useUpdateUser, useUser } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import { FormField, inputClass, labelClass } from "@/components/settings/form-field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";

function emptyState() {
  return {
    name: "",
    phone: "",
    gender: "",
    roleId: "",
    isActive: true,
  };
}

/**
 * Edit User dialog for Access → Users. Mirrors create-user-dialog.tsx's
 * hand-rolled fixed-overlay markup and components/settings/form-field.tsx
 * styling — no new dialog primitive introduced.
 *
 * Fetches the user's current profile + assigned role via useUser(userId)
 * (the Users table's list response doesn't include role, only the detail
 * endpoint does) and pre-fills the form once it loads. Email is shown
 * read-only — the backend's AdminUpdateUserSerializer doesn't accept it, by
 * design, so it's never sent in the PATCH body.
 *
 * PATCH /api/auth/users/{id}/ is also the same call the table's quick
 * Activate/Deactivate action uses — this dialog's "Active" switch is not a
 * second, parallel path.
 */
export function EditUserDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading: userLoading, isError, error, refetch } = useUser(userId ?? NaN);
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const update = useUpdateUser();
  const [form, setForm] = useState(emptyState());
  const [error2, setError2] = useState<string | null>(null);

  const resetDeps = [open, data];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    if (data) {
      setForm({
        name: data.user.name,
        phone: data.user.phone ?? "",
        gender: data.user.gender ?? "",
        roleId: data.role ? String(data.role.id) : "",
        isActive: data.user.isActive ?? true,
      });
      setError2(null);
    }
  }

  if (!open || userId === null) return null;

  function set<K extends keyof ReturnType<typeof emptyState>>(
    key: K,
    value: ReturnType<typeof emptyState>[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError2(null);

    const name = form.name.trim();
    if (!name) {
      setError2("Full name is required.");
      return;
    }

    try {
      const { user } = await update.mutateAsync({
        userId: userId as number,
        input: {
          name,
          phone: form.phone.trim(),
          gender: form.gender,
          isActive: form.isActive,
          roleId: form.roleId === "" ? undefined : Number(form.roleId),
        },
      });
      toast.success(`${user.name} was updated.`);
      onOpenChange(false);
    } catch (err) {
      setError2(err instanceof ApiError ? err.message : "Could not update this user.");
    }
  }

  const loading = userLoading || (data === undefined && !isError);

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
            <p className="text-sm text-destructive">
              {error instanceof ApiError ? error.message : "Could not load this user."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-5 overflow-y-auto p-6 pr-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Edit user</h2>
                <p className="text-sm text-muted-foreground">
                  Update {data?.user.name}&apos;s profile, role, and access.
                </p>
              </div>

              <FormField label="Email" hint="Email cannot be changed after creation.">
                <input
                  type="email"
                  className={inputClass}
                  value={data?.user.email ?? ""}
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

              <FormField label="Role">
                <select
                  className={inputClass}
                  value={form.roleId}
                  onChange={(e) => set("roleId", e.target.value)}
                  disabled={rolesLoading}
                >
                  <option value="">
                    {rolesLoading ? "Loading roles…" : "No role assigned"}
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
                    Inactive accounts cannot sign in to the Admin Panel or mobile app.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
              </div>

              {error2 && <p className="text-sm text-destructive">{error2}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending && <Spinner className="text-primary-foreground" />}
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
