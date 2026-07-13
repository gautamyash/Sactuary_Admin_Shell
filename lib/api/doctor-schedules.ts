import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/** Backend `DoctorSchedule.Weekday` (IntegerChoices): 0=Monday .. 6=Sunday. */
export interface DoctorSchedule {
  id: number;
  doctorId: number;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
}

interface RawDoctorSchedule {
  id: number;
  doctor: number;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
}

function toSchedule(s: RawDoctorSchedule): DoctorSchedule {
  return {
    id: s.id,
    doctorId: s.doctor,
    weekday: s.weekday,
    startTime: s.start_time,
    endTime: s.end_time,
    slotMinutes: s.slot_minutes,
  };
}

export interface DoctorScheduleInput {
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
}

function toRawInput(input: Partial<DoctorScheduleInput>) {
  const body: Record<string, unknown> = {};
  if (input.weekday !== undefined) body.weekday = input.weekday;
  if (input.startTime !== undefined) body.start_time = input.startTime;
  if (input.endTime !== undefined) body.end_time = input.endTime;
  if (input.slotMinutes !== undefined) body.slot_minutes = input.slotMinutes;
  return body;
}

export const doctorSchedulesApi = {
  async list(doctorId: number): Promise<DoctorSchedule[]> {
    const data = await http.get<{ results: RawDoctorSchedule[] } | RawDoctorSchedule[]>(
      endpoints.doctors.schedules(doctorId),
    );
    const rows = Array.isArray(data) ? data : (data.results ?? []);
    return rows.map(toSchedule);
  },

  async create(doctorId: number, input: DoctorScheduleInput): Promise<DoctorSchedule> {
    const data = await http.post<RawDoctorSchedule>(
      endpoints.doctors.schedules(doctorId),
      toRawInput(input),
    );
    return toSchedule(data);
  },

  async update(
    doctorId: number,
    scheduleId: number,
    input: Partial<DoctorScheduleInput>,
  ): Promise<DoctorSchedule> {
    const data = await http.patch<RawDoctorSchedule>(
      endpoints.doctors.scheduleDetail(doctorId, scheduleId),
      toRawInput(input),
    );
    return toSchedule(data);
  },

  async remove(doctorId: number, scheduleId: number): Promise<void> {
    await http.delete(endpoints.doctors.scheduleDetail(doctorId, scheduleId));
  },
};
