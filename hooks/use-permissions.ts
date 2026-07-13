"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Permission helpers bound to the current session.
 *
 * Usage:
 *   const { has, hasAny, hasAll } = usePermissions();
 *   if (has("billing.view")) { ... }
 *
 * When `code` is undefined, access is granted (used for ungated nav items).
 */
export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const roles = useAuthStore((s) => s.roles);

  const has = (code?: string) => (code ? permissions.includes(code) : true);
  const hasAny = (codes: string[]) => codes.some((c) => permissions.includes(c));
  const hasAll = (codes: string[]) => codes.every((c) => permissions.includes(c));

  return { permissions, roles, has, hasAny, hasAll };
}
