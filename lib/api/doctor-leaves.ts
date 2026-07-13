import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface DoctorLeave {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

interface RawDoctorLeave {
  id: number;
  doctor: number;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
}

function toLeave(l: RawDoctorLeave): DoctorLeave {
  return {
    id: l.id,
    doctorId: l.doctor,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason ?? "",
    createdAt: l.created_at,
  };
}

export interface DoctorLeaveInput {
  startDate: string;
  endDate: string;
  reason?: string;
}

function toRawInput(input: Partial<DoctorLeaveInput>) {
  const body: Record<string, unknown> = {};
  if (input.startDate !== undefined) body.start_date = input.startDate;
  if (input.endDate !== undefined) body.end_date = input.endDate;
  if (input.reason !== undefined) body.reason = input.reason;
  return body;
}

export const doctorLeavesApi = {
  async list(doctorId: number): Promise<DoctorLeave[]> {
    const data = await http.get<{ results: RawDoctorLeave[] } | RawDoctorLeave[]>(
      endpoints.doctors.leaves(doctorId),
    );
    const rows = Array.isArray(data) ? data : (data.results ?? []);
    return rows.map(toLeave);
  },

  async create(doctorId: number, input: DoctorLeaveInput): Promise<DoctorLeave> {
    const data = await http.post<RawDoctorLeave>(
      endpoints.doctors.leaves(doctorId),
      toRawInput(input),
    );
    return toLeave(data);
  },

  async update(
    doctorId: number,
    leaveId: number,
    input: Partial<DoctorLeaveInput>,
  ): Promise<DoctorLeave> {
    const data = await http.patch<RawDoctorLeave>(
      endpoints.doctors.leaveDetail(doctorId, leaveId),
      toRawInput(input),
    );
    return toLeave(data);
  },

  async remove(doctorId: number, leaveId: number): Promise<void> {
    await http.delete(endpoints.doctors.leaveDetail(doctorId, leaveId));
  },
};
