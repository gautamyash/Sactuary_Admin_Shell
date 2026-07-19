/**
 * Shared domain types for the web admin.
 *
 * These mirror the Django backend's response shapes (see the mobile app's
 * lib/api.ts mappers, which are the canonical contract). Only the types the
 * foundation needs are defined here; business-domain types are added per
 * feature phase.
 */

import type { LucideIcon } from "lucide-react";

/** Authenticated user, normalized from `/api/auth/me/`.
 *
 * `phone`/`gender`/`isActive` added (Phase: Complete User Management) —
 * present on the admin user list/detail/create/edit responses (all backed
 * by the same accounts.UserSerializer), optional here so this type still
 * fits the narrower `/api/auth/me/` shape other call sites use. */
export interface User {
  id?: number;
  name: string;
  email: string;
  isStaff?: boolean;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | null;
  isActive?: boolean;
}

/** A single RBAC permission from `/api/auth/permissions/`. */
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

/** An RBAC role from `/api/auth/roles/`. */
export interface Role {
  id: number;
  name: string;
  description: string;
  systemRole: boolean;
  priority: number;
  createdAt: string;
}

/** The caller's effective roles + permission codes from `/api/auth/me/permissions/`. */
export interface MyPermissions {
  roles: string[];
  permissions: string[];
}

/** Result of a role assignment (`POST /api/auth/users/{id}/role/`). */
export interface UserRole {
  id: number;
  role: Role;
  assignedBy: string;
  assignedAt: string;
}

/** Session bootstrap payload combining the user and their permissions. */
export interface Session {
  user: User;
  roles: string[];
  permissions: string[];
}

export type SessionStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

/** A single item in the sidebar navigation configuration. */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /**
   * RBAC permission code required to see and access this item. When omitted,
   * the item is visible to any authenticated user.
   */
  permission?: string;
  /** Optional grouping label for sectioned navigation. */
  section?: "main" | "footer";
}
