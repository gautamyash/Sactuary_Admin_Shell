import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toRole, type RawRole } from "@/lib/api/mappers";
import type { Role } from "@/types";

export const rolesApi = {
  async list(): Promise<Role[]> {
    const data = await http.get<RawRole[]>(endpoints.roles.list);
    return data.map(toRole);
  },
};
