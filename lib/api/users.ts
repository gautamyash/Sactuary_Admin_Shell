import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  toPermission,
  toRole,
  toUser,
  toUserRole,
  type RawPermission,
  type RawRole,
  type RawUser,
  type RawUserRole,
} from "@/lib/api/mappers";
import type { Permission, Role, User, UserRole } from "@/types";

export const usersApi = {
  async list(search?: string): Promise<User[]> {
    const qs = search ? `?q=${encodeURIComponent(search)}` : "";
    const data = await http.get<{ results: RawUser[] }>(`${endpoints.users.list}${qs}`);
    return data.results.map(toUser);
  },

  async get(
    id: number,
  ): Promise<{ user: User; role: Role | null; permissions: Permission[] }> {
    const data = await http.get<{
      user: RawUser;
      role: RawRole | null;
      permissions: RawPermission[];
    }>(endpoints.users.detail(id));
    return {
      user: toUser(data.user),
      role: data.role ? toRole(data.role) : null,
      permissions: (data.permissions ?? []).map(toPermission),
    };
  },

  async assignRole(userId: number, roleId: number): Promise<UserRole> {
    const data = await http.post<RawUserRole>(endpoints.users.role(userId), {
      role: roleId,
    });
    return toUserRole(data);
  },
};
