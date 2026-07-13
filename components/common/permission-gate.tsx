"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  /** Require this single permission code. */
  permission?: string;
  /** Require ANY of these codes. */
  anyOf?: string[];
  /** Require ALL of these codes. */
  allOf?: string[];
  /** Rendered when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative client-side authorization boundary. Renders `children` only when
 * the current session satisfies the requested permission(s). This is the UI
 * companion to server-side RBAC enforcement — it hides controls the user can't
 * use, but the backend remains the actual authority.
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { has, hasAny, hasAll } = usePermissions();

  const allowed =
    (permission ? has(permission) : true) &&
    (anyOf ? hasAny(anyOf) : true) &&
    (allOf ? hasAll(allOf) : true);

  return <>{allowed ? children : fallback}</>;
}
