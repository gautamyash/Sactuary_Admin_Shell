import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

// Phase: Advanced Doctor Schedule & Leave Management — `status` is already
// writable on the backend's DoctorLeaveSerializer (pending/approved/rejected,
// defaults to pending) but was never surfaced on the admin panel. Only
// `status` is added here per that phase's explicit "Status (only if already
// supported)" scope — `leave_type`/`notes`/`approved_by` were not asked for
// and stay unexposed.
export type DoctorLeaveStatus = "pending" | "approved" | "rejected";

export interface DoctorLeave {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: DoctorLeaveStatus;
  createdAt: string;
}

interface RawDoctorLeave {
  id: number;
  doctor: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: DoctorLeaveStatus;
  created_at: string;
}

function toLeave(l: RawDoctorLeave): DoctorLeave {
  return {
    id: l.id,
    doctorId: l.doctor,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason ?? "",
    status: l.status ?? "pending",
    createdAt: l.created_at,
  };
}

export interface DoctorLeaveInput {
  startDate: string;
  endDate: string;
  reason?: string;
  status?: DoctorLeaveStatus;
}

function toRawInput(input: Partial<DoctorLeaveInput>) {
  const body: Record<string, unknown> = {};
  if (input.startDate !== undefined) body.start_date = input.startDate;
  if (input.endDate !== undefined) body.end_date = input.endDate;
  if (input.reason !== undefined) body.reason = input.reason;
  if (input.status !== undefined) body.status = input.status;
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
