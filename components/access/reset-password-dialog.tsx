"use client";

import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useResetPassword } from "@/components/access/queries";
import { Spinner } from "@/components/common/spinner";
import { FormField, inputClass } from "@/components/settings/form-field";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/types";

/**
 * Reset Password dialog for Access → Users — POST
 * /api/auth/users/{id}/reset-password/, gated server-side on "user.edit".
 *
 * Confirm-password matching is checked client-side only, mirroring how the
 * backend's AdminResetPasswordSerializer takes just `new_password` (the same
 * division PasswordResetConfirmSerializer already uses). The server still
 * runs Django's full validate_password check and returns its errors as-is —
 * this dialog doesn't duplicate that logic, it only adds the "do these two
 * fields match" check a server round-trip can't usefully do.
 */
export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reset = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open, user?.id]);

  if (!open || !user) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setError(null);

    if (!newPassword) {
      setError("Enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await reset.mutateAsync({ userId: user.id, newPassword });
      toast.success(`Password reset for ${user.name}.`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset the password.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => onOpenChange(false)} />
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
          <h2 className="text-lg font-semibold text-foreground">Reset password</h2>
          <p className="text-sm text-muted-foreground">
            Set a new password for{" "}
            <span className="font-medium text-foreground">{user.name}</span> ({user.email}).
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <FormField label="New password">
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Enter a new password"
            />
          </FormField>

          <FormField label="Confirm password">
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Re-enter the new password"
            />
          </FormField>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reset.isPending}>
              {reset.isPending && <Spinner className="text-primary-foreground" />}
              Reset password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
