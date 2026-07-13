/**
 * Authentication / session store.
 *
 * Holds the current user and their effective RBAC roles + permission codes.
 * Credentials (tokens) live in cookies via `tokenStorage`, not here — this
 * store only mirrors identity and authorization state for the UI. Permission
 * checks throughout the app read from this store.
 */

import { create } from "zustand";

import type { Session, SessionStatus, User } from "@/types";

interface AuthState {
  user: User | null;
  roles: string[];
  permissions: string[];
  status: SessionStatus;

  setStatus: (status: SessionStatus) => void;
  setSession: (session: Session) => void;
  clear: () => void;

  /** True when the user holds the given permission code. */
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  status: "idle",

  setStatus: (status) => set({ status }),

  setSession: (session) =>
    set({
      user: session.user,
      roles: session.roles,
      permissions: session.permissions,
      status: "authenticated",
    }),

  clear: () =>
    set({ user: null, roles: [], permissions: [], status: "unauthenticated" }),

  hasPermission: (code) => get().permissions.includes(code),
  hasAnyPermission: (codes) => codes.some((c) => get().permissions.includes(c)),
  hasAllPermissions: (codes) => codes.every((c) => get().permissions.includes(c)),
}));
