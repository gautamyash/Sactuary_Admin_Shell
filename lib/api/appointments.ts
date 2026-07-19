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
  /** Phase: Admin Medical Visit Management — scopes the admin list to one
   * patient's own appointments, e.g. so "Add Visit" can list which of a
   * patient's appointments are eligible to be completed into a visit.
   * Maps to the backend's existing `?patient=` filter. */
  patient?: number;
  q?: string;
}

/** Input for the new POST /api/admin/appointments/ (Phase: Admin Follow-up &
 * Care Plan). Only doctor/date/time are required server-side (visit_type and
 * estimated_duration are optional there and default sensibly); this stays
 * minimal and doesn't expose those two, since nothing in this phase's scope
 * needs them and no existing Admin Panel UI selects a visit type yet. */
export interface CreateAppointmentInput {
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  reason?: string;
}

export const appointmentsApi = {
  async adminList(params?: AdminAppointmentParams): Promise<AdminAppointment[]> {
    const search = new URLSearchParams();
    if (params?.date) search.set("date", params.date);
    if (params?.dateFrom) search.set("date_from", params.dateFrom);
    if (params?.dateTo) search.set("date_to", params.dateTo);
    if (params?.status) search.set("status", params.status);
    if (params?.doctor) search.set("doctor", String(params.doctor));
    if (params?.patient) search.set("patient", String(params.patient));
    if (params?.q) search.set("q", params.q);
    const qs = search.toString() ? `?${search.toString()}` : "";
    const data = await http.get<{ results: RawAdminAppointment[] }>(
      `${endpoints.appointments.adminList}${qs}`,
    );
    return (data.results ?? []).map(toAdminAppointment);
  },

  /** POST /api/appointments/{id}/complete/ — reused as-is (Phase: Admin
   * Medical Visit Management). Not new: this is the existing endpoint that
   * already auto-creates the MedicalVisit via the backend's post_save
   * signal on Appointment; "Add Visit" in the Admin Panel is this call. */
  async complete(id: number, actualMinutes?: number): Promise<AdminAppointment> {
    const body = actualMinutes !== undefined ? { actual_minutes: actualMinutes } : {};
    const data = await http.post<RawAdminAppointment>(
      endpoints.appointments.complete(id),
      body,
    );
    return toAdminAppointment(data);
  },

  /** POST /api/admin/appointments/ — staff books an appointment on behalf of
   * a patient (Phase: Admin Follow-up & Care Plan). Same URL as adminList's
   * GET, now also accepting POST server-side; no new endpoint was added,
   * just a new method on the existing AdminAppointmentListView, reusing the
   * same booking engine (AppointmentSerializer + BookingService.book()) the
   * patient-facing self-service booking already uses. Gated on
   * "appointment.create". */
  async create(input: CreateAppointmentInput): Promise<AdminAppointment> {
    const body: Record<string, unknown> = {
      patient: input.patientId,
      doctor: input.doctorId,
      date: input.date,
      time: input.time,
    };
    if (input.reason !== undefined) body.reason = input.reason;
    const data = await http.post<RawAdminAppointment>(endpoints.appointments.adminList, body);
    return toAdminAppointment(data);
  },
};
