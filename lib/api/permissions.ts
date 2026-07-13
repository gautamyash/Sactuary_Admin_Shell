import { authApi } from "@/lib/api/auth";
import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPermission, type RawPermission } from "@/lib/api/mappers";
import type { MyPermissions, Permission } from "@/types";

export const permissionsApi = {
  async list(): Promise<Permission[]> {
    const data = await http.get<RawPermission[]>(endpoints.permissions.list);
    return data.map(toPermission);
  },

  myPermissions(): Promise<MyPermissions> {
    return authApi.myPermissions();
  },
};
