/**
 * Auth API calls + response mappers (snake_case → camelCase).
 *
 * Mirrors the mobile client's contract so both clients stay in sync.
 */

import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { tokenStorage } from "@/lib/api/token-storage";
import type { MyPermissions, Session, User } from "@/types";

interface RawUser {
  id?: number;
  name: string;
  email: string;
  is_staff?: boolean;
}

function toUser(u: RawUser): User {
  return { id: u.id, name: u.name, email: u.email, isStaff: u.is_staff };
}

export const authApi = {
  /** Obtain a JWT pair and persist it. */
  async login(email: string, password: string): Promise<User> {
    const data = await http.post<{ access: string; refresh: string }>(
      endpoints.auth.token,
      { email, password },
    );
    tokenStorage.setTokens(data.access, data.refresh);
    return authApi.me();
  },

  async me(): Promise<User> {
    return toUser(await http.get<RawUser>(endpoints.auth.me));
  },

  async myPermissions(): Promise<MyPermissions> {
    return http.get<MyPermissions>(endpoints.auth.myPermissions);
  },

  /** Bootstrap the full session (user + effective roles/permissions). */
  async session(): Promise<Session> {
    const [user, perms] = await Promise.all([authApi.me(), authApi.myPermissions()]);
    return { user, roles: perms.roles ?? [], permissions: perms.permissions ?? [] };
  },

  /**
   * Client-side logout. The backend exposes no token-blacklist endpoint yet
   * (a documented gap), so this clears local credentials only.
   */
  logout() {
    tokenStorage.clear();
  },
};
