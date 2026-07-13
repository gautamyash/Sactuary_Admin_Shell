"use client";

import { ShieldCheck } from "lucide-react";

import { useRoles } from "@/components/access/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";

export function RolesList() {
  const { data: roles, isLoading, isError, error, refetch } = useRoles();

  if (isLoading) return <LoadingScreen label="Loading roles…" />;
  if (isError || !roles) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          System roles
        </h2>
        <Badge variant="secondary">{roles.length} total</Badge>
      </div>

      {roles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No roles defined.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <p className="font-semibold text-foreground">{role.name}</p>
                </div>
                {role.systemRole ? (
                  <Badge>System</Badge>
                ) : (
                  <Badge variant="secondary">Custom</Badge>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
              <p className="mt-4 text-xs text-muted-foreground">Priority {role.priority}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
