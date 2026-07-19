"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAssignRole, useRoles } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/types";

/**
 * Assign Role dialog — selects a role and assigns it to a user via
 * POST /api/auth/users/{id}/role/ (gated system.admin on the backend).
 */
export function AssignRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: roles, isLoading } = useRoles();
  const assign = useAssignRole();
  const [roleId, setRoleId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const resetDeps = [open, user?.id];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setRoleId("");
    setError(null);
  }

  if (!open || !user) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user?.id || roleId === "") return;
    setError(null);
    try {
      await assign.mutateAsync({ userId: user.id, roleId: Number(roleId) });
      toast.success(`Role assigned to ${user.name}.`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not assign the role.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Assign role</h2>
          <p className="text-sm text-muted-foreground">
            Assign a role to{" "}
            <span className="font-medium text-foreground">{user.name}</span> ({user.email}).
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            >
              <option value="" disabled>
                {isLoading ? "Loading roles…" : "Select a role"}
              </option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={assign.isPending || roleId === ""}>
              {assign.isPending && <Spinner className="text-primary-foreground" />}
              Assign role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
