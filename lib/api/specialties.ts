import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface Specialty {
  id: number;
  name: string;
  icon?: string;
}

interface RawSpecialty {
  id: number;
  name: string;
  icon?: string;
}

export const specialtiesApi = {
  async list(): Promise<Specialty[]> {
    const data = await http.get<RawSpecialty[]>(endpoints.specialties.list);
    return (data ?? []).map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
  },
};
