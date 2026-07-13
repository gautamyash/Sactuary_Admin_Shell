"use client";

import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AssignRoleDialog } from "@/components/access/assign-role-dialog";
import { useUsers } from "@/components/access/queries";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading, isError, error, refetch } = useUsers(
    search.trim() || undefined,
  );
  const [assignUser, setAssignUser] = useState<User | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-5 py-10">
                  <LoadingScreen label="Loading users…" />
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={3} className="px-5 py-10">
                  <ErrorState error={error} onRetry={() => refetch()} />
                </td>
              </tr>
            )}

            {!isLoading && !isError && users?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}

            {users?.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {user.isStaff ? (
                    <Badge variant="success">Staff</Badge>
                  ) : (
                    <Badge variant="secondary">Patient</Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionGate permission="system.admin">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignUser(user)}
                      >
                        <UserPlus className="size-3.5" />
                        Assign role
                      </Button>
                    </PermissionGate>
                    <Link
                      href={`/access/users/${user.id}`}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AssignRoleDialog
        user={assignUser}
        open={assignUser !== null}
        onOpenChange={(open) => !open && setAssignUser(null)}
      />
    </div>
  );
}
