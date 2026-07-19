"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { permissionsApi } from "@/lib/api/permissions";
import { rolesApi } from "@/lib/api/roles";
import { usersApi, type CreateUserInput, type UpdateUserInput } from "@/lib/api/users";

export const accessKeys = {
  users: (search?: string) => ["access", "users", search ?? ""] as const,
  user: (id: number) => ["access", "user", id] as const,
  roles: () => ["access", "roles"] as const,
  permissions: () => ["access", "permissions"] as const,
};

export function useUsers(search?: string) {
  return useQuery({
    queryKey: accessKeys.users(search),
    queryFn: () => usersApi.list(search),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: accessKeys.user(id),
    queryFn: () => usersApi.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: accessKeys.roles(),
    queryFn: () => rolesApi.list(),
  });
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: accessKeys.permissions(),
    queryFn: () => permissionsApi.list(),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: number; roleId: number }) =>
      usersApi.assignRole(vars.userId, vars.roleId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["access", "users"] });
      qc.invalidateQueries({ queryKey: accessKeys.user(vars.userId) });
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access", "users"] });
    },
  });
}

/** Backs both the Edit User dialog and the table's quick Activate/Deactivate
 * action — both are the same PATCH under the hood, so both invalidate the
 * same queries and the table/detail view refresh immediately either way. */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: number; input: UpdateUserInput }) =>
      usersApi.update(vars.userId, vars.input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["access", "users"] });
      qc.invalidateQueries({ queryKey: accessKeys.user(vars.userId) });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (vars: { userId: number; newPassword: string }) =>
      usersApi.resetPassword(vars.userId, vars.newPassword),
  });
}
