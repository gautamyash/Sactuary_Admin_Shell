"use client";

import type { ReactNode } from "react";

import { ErrorState } from "@/components/common/error-state";
import { usePermissions } from "@/hooks/use-permissions";

/**
 * Page-level authorization boundary for the Access Management module. Renders
 * the section only when the current session satisfies the required RBAC
 * permission(s); otherwise shows an access-denied panel. The backend remains
 * the actual authority — this mirrors its gating in the UI.
 */
export function RequirePermission({
  permission,
  anyOf,
  children,
}: {
  permission?: string;
  anyOf?: string[];
  children: ReactNode;
}) {
  const { has, hasAny } = usePermissions();
  const allowed = permission ? has(permission) : anyOf ? hasAny(anyOf) : true;

  if (!allowed) {
    return (
      <ErrorState
        title="You don't have access"
        description="You don't have permission to view this section. Contact an administrator if you believe this is a mistake."
      />
    );
  }
  return <>{children}</>;
}
