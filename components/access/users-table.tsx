"use client";

import { KeyRound, MoreVertical, Pencil, Plus, Power, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AssignRoleDialog } from "@/components/access/assign-role-dialog";
import { CreateUserDialog } from "@/components/access/create-user-dialog";
import { EditUserDialog } from "@/components/access/edit-user-dialog";
import { useUpdateUser, useUsers } from "@/components/access/queries";
import { ResetPasswordDialog } from "@/components/access/reset-password-dialog";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/types";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading, isError, error, refetch } = useUsers(
    search.trim() || undefined,
  );
  const [assignUser, setAssignUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const updateUser = useUpdateUser();

  async function toggleActive(user: User) {
    if (!user.id) return;
    setMenuOpenId(null);
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        input: { isActive: !user.isActive },
      });
      toast.success(
        user.isActive ? `${user.name} was deactivated.` : `${user.name} was activated.`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update this user's status.",
      );
    }
  }

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
        <PermissionGate permission="user.create">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New User
          </Button>
        </PermissionGate>
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    {user.isStaff ? (
                      <Badge variant="success">Staff</Badge>
                    ) : (
                      <Badge variant="secondary">Patient</Badge>
                    )}
                    {user.isActive === false && <Badge variant="destructive">Inactive</Badge>}
                  </div>
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
                    <PermissionGate permission="user.edit">
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="User actions"
                          onClick={() =>
                            setMenuOpenId((v) => (v === user.id ? null : (user.id ?? null)))
                          }
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {menuOpenId === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setEditUserId(user.id ?? null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setResetPasswordUser(user);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                              >
                                <KeyRound className="size-3.5" />
                                Reset password
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActive(user)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                              >
                                <Power className="size-3.5" />
                                {user.isActive === false ? "Activate" : "Deactivate"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        userId={editUserId}
        open={editUserId !== null}
        onOpenChange={(open) => !open && setEditUserId(null)}
      />
      <ResetPasswordDialog
        user={resetPasswordUser}
        open={resetPasswordUser !== null}
        onOpenChange={(open) => !open && setResetPasswordUser(null)}
      />
    </div>
  );
}
