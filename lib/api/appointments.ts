import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface AdminAppointment {
  id: number;
  status: string;
  date: string;
  time: string;
  timeLabel: string;
  queuePosition: number | null;
  checkedInAt: string | null;
  doctorName: string;
  specialty: string;
  patientId: number | null;
  patientName: string;
  patientReference: string | null;
}

interface RawAdminAppointment {
  id: number;
  status: string;
  date: string;
  time: string;
  time_label: string;
  queue_position: number | null;
  patient_checked_in_at: string | null;
  doctor_detail: { name: string; specialty: string } | null;
  patient_id?: number | null;
  patient_name?: string;
  patient_reference?: string | null;
}

function toAdminAppointment(a: RawAdminAppointment): AdminAppointment {
  return {
    id: a.id,
    status: a.status,
    date: a.date,
    time: a.time,
    timeLabel: a.time_label,
    queuePosition: a.queue_position ?? null,
    checkedInAt: a.patient_checked_in_at ?? null,
    doctorName: a.doctor_detail?.name ?? "—",
    specialty: a.doctor_detail?.specialty ?? "—",
    patientId: a.patient_id ?? null,
    patientName: a.patient_name ?? "—",
    patientReference: a.patient_reference ?? null,
  };
}

export interface AdminAppointmentParams {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  doctor?: number | string;
  q?: string;
}

export const appointmentsApi = {
  async adminList(params?: AdminAppointmentParams): Promise<AdminAppointment[]> {
    const search = new URLSearchParams();
    if (params?.date) search.set("date", params.date);
    if (params?.dateFrom) search.set("date_from", params.dateFrom);
    if (params?.dateTo) search.set("date_to", params.dateTo);
    if (params?.status) search.set("status", params.status);
    if (params?.doctor) search.set("doctor", String(params.doctor));
    if (params?.q) search.set("q", params.q);
    const qs = search.toString() ? `?${search.toString()}` : "";
    const data = await http.get<{ results: RawAdminAppointment[] }>(
      `${endpoints.appointments.adminList}${qs}`,
    );
    return (data.results ?? []).map(toAdminAppointment);
  },
};
