import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  yearsExperience: number;
  fee: number;
  about: string;
  photo?: string;
  color?: string;
  onDuty: boolean;
  onLeave: boolean;
  wing: string;
  floor: string;
  room: string;
}

interface RawDoctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  address?: string;
  distance_km?: string | number;
  rating?: string | number;
  reviews?: number;
  years_experience?: number;
  fee?: string | number;
  about?: string;
  photo: string;
  color: string;
  on_duty?: boolean;
  on_leave?: boolean;
  wing?: string;
  floor?: string;
  room?: string;
}

const num = (v: string | number | null | undefined) => (v == null ? 0 : Number(v));

function toDoctor(d: RawDoctor): Doctor {
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    hospital: d.hospital,
    address: d.address ?? "",
    distanceKm: num(d.distance_km),
    rating: num(d.rating),
    reviews: d.reviews ?? 0,
    yearsExperience: d.years_experience ?? 0,
    fee: num(d.fee),
    about: d.about ?? "",
    photo: d.photo || undefined,
    color: d.color,
    onDuty: d.on_duty ?? false,
    onLeave: d.on_leave ?? false,
    wing: d.wing ?? "",
    floor: d.floor ?? "",
    room: d.room ?? "",
  };
}

export interface DoctorListParams {
  specialty?: string;
  search?: string;
}

/** Payload for create/update. `specialtyId` maps to the write serializer's
 * writable `specialty` (PK) field — distinct from the read shape's
 * display-only specialty name. */
export interface DoctorInput {
  name: string;
  specialtyId: number;
  hospital: string;
  address?: string;
  distanceKm?: number;
  yearsExperience?: number;
  fee?: number;
  about?: string;
  photo?: string;
  color?: string;
  onDuty?: boolean;
  onLeave?: boolean;
  wing?: string;
  floor?: string;
  room?: string;
}

function toRawInput(input: DoctorInput) {
  return {
    name: input.name,
    specialty: input.specialtyId,
    hospital: input.hospital,
    address: input.address ?? "",
    distance_km: input.distanceKm ?? 0,
    years_experience: input.yearsExperience ?? 0,
    fee: input.fee ?? 0,
    about: input.about ?? "",
    photo: input.photo ?? "",
    color: input.color ?? "#003d9b",
    on_duty: input.onDuty ?? false,
    on_leave: input.onLeave ?? false,
    wing: input.wing ?? "",
    floor: input.floor ?? "",
    room: input.room ?? "",
  };
}

export const doctorsApi = {
  async list(params?: DoctorListParams): Promise<Doctor[]> {
    const search = new URLSearchParams();
    if (params?.specialty) search.set("specialty", params.specialty);
    if (params?.search) search.set("search", params.search);
    const qs = search.toString() ? `?${search.toString()}` : "";
    const data = await http.get<{ results: RawDoctor[] }>(`${endpoints.doctors.list}${qs}`);
    return (data.results ?? []).map(toDoctor);
  },

  async get(id: number): Promise<Doctor> {
    const data = await http.get<RawDoctor>(endpoints.doctors.detail(id));
    return toDoctor(data);
  },

  async create(input: DoctorInput): Promise<Doctor> {
    const data = await http.post<RawDoctor>(endpoints.doctors.list, toRawInput(input));
    return toDoctor(data);
  },

  async update(id: number, input: Partial<DoctorInput>): Promise<Doctor> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.specialtyId !== undefined) body.specialty = input.specialtyId;
    if (input.hospital !== undefined) body.hospital = input.hospital;
    if (input.address !== undefined) body.address = input.address;
    if (input.distanceKm !== undefined) body.distance_km = input.distanceKm;
    if (input.yearsExperience !== undefined) body.years_experience = input.yearsExperience;
    if (input.fee !== undefined) body.fee = input.fee;
    if (input.about !== undefined) body.about = input.about;
    if (input.photo !== undefined) body.photo = input.photo;
    if (input.color !== undefined) body.color = input.color;
    if (input.onDuty !== undefined) body.on_duty = input.onDuty;
    if (input.onLeave !== undefined) body.on_leave = input.onLeave;
    if (input.wing !== undefined) body.wing = input.wing;
    if (input.floor !== undefined) body.floor = input.floor;
    if (input.room !== undefined) body.room = input.room;
    const data = await http.patch<RawDoctor>(endpoints.doctors.detail(id), body);
    return toDoctor(data);
  },

  /** Soft delete — the backend sets is_active=False rather than removing the row. */
  async remove(id: number): Promise<void> {
    await http.delete(endpoints.doctors.detail(id));
  },
};
