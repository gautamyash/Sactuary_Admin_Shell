"use client";

import { ChevronLeft, Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AssignRoleDialog } from "@/components/access/assign-role-dialog";
import { EditUserDialog } from "@/components/access/edit-user-dialog";
import { useUser } from "@/components/access/queries";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/types";

function groupByCategory(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  for (const p of permissions) {
    (groups[p.category] ??= []).push(p);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export function UserDetailView({ id }: { id: number }) {
  const { data, isLoading, isError, error, refetch } = useUser(id);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const grouped = useMemo(
    () => groupByCategory(data?.permissions ?? []),
    [data?.permissions],
  );

  if (isLoading) return <LoadingScreen label="Loading user…" />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  const { user, role, permissions } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/access/users"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to users
      </Link>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Profile + role */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={user.name} className="size-16 text-lg" />
              <p className="mt-3 text-lg font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex items-center gap-1.5">
                {user.isStaff ? (
                  <Badge variant="success">Staff</Badge>
                ) : (
                  <Badge variant="secondary">Patient</Badge>
                )}
                {user.isActive === false && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <PermissionGate permission="user.edit">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Edit user
                </Button>
              </PermissionGate>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Assigned role
              </h2>
              <PermissionGate permission="system.admin">
                <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
                  <UserPlus className="size-3.5" />
                  Assign
                </Button>
              </PermissionGate>
            </div>
            {role ? (
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{role.name}</Badge>
                  {role.systemRole && <Badge variant="secondary">System</Badge>}
                </div>
                {role.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No role assigned.</p>
            )}
          </div>
        </div>

        {/* Effective permissions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Effective permissions
            </h2>
            <Badge variant="secondary">{permissions.length} total</Badge>
          </div>

          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This user has no permissions granted.
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([category, perms]) => (
                <div key={category}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <p className="text-sm font-medium text-foreground">{perm.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{perm.code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AssignRoleDialog user={user} open={assignOpen} onOpenChange={setAssignOpen} />
      <EditUserDialog userId={user.id ?? null} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
