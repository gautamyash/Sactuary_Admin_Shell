/**
 * Raw backend shapes (snake_case) + mappers to domain types (camelCase).
 * Ported from the React Native client's api.ts contract so both clients stay
 * in sync.
 */

import type { Permission, Role, User, UserRole } from "@/types";

export interface RawUser {
  id?: number;
  name: string;
  email: string;
  date_joined?: string;
  is_staff?: boolean;
}

export interface RawRole {
  id: number;
  name: string;
  description: string;
  system_role: boolean;
  priority: number;
  created_at: string;
}

export interface RawPermission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface RawUserRole {
  id: number;
  role: RawRole;
  assigned_by: string;
  assigned_at: string;
}

export function toUser(u: RawUser): User {
  return { id: u.id, name: u.name, email: u.email, isStaff: u.is_staff };
}

export function toRole(r: RawRole): Role {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    systemRole: r.system_role,
    priority: r.priority,
    createdAt: r.created_at,
  };
}

export function toPermission(p: RawPermission): Permission {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    category: p.category,
  };
}

export function toUserRole(ur: RawUserRole): UserRole {
  return {
    id: ur.id,
    role: toRole(ur.role),
    assignedBy: ur.assigned_by,
    assignedAt: ur.assigned_at,
  };
}
