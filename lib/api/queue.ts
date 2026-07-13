import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/** Row states surfaced by the queue (distinct from Appointment.Status). */
export type QueueRowState = "completed" | "in_progress" | "waiting";

export interface QueueTimelineRow {
  appointmentId: number;
  patientName: string;
  scheduledTime: string;
  queuePosition: number | null;
  state: QueueRowState;
  estimatedStart: string | null;
  estimatedFinish: string | null;
  checkedIn: boolean;
}

export interface DoctorQueue {
  doctorId: number;
  date: string;
  delayMinutes: number;
  doctorRunningLate: boolean;
  estimatedFinishTime: string | null;
  timeline: QueueTimelineRow[];
}

interface RawQueueTimelineRow {
  appointment_id: number;
  patient_name: string;
  scheduled_time: string;
  queue_position: number | null;
  state: QueueRowState;
  estimated_start: string | null;
  estimated_finish: string | null;
  checked_in: boolean;
}

interface RawDoctorQueue {
  doctor_id: number;
  date: string;
  delay_minutes: number;
  doctor_running_late: boolean;
  estimated_finish_time: string | null;
  timeline: RawQueueTimelineRow[];
}

function toDoctorQueue(d: RawDoctorQueue): DoctorQueue {
  return {
    doctorId: d.doctor_id,
    date: d.date,
    delayMinutes: d.delay_minutes,
    doctorRunningLate: d.doctor_running_late,
    estimatedFinishTime: d.estimated_finish_time ?? null,
    timeline: (d.timeline ?? []).map((r) => ({
      appointmentId: r.appointment_id,
      patientName: r.patient_name,
      scheduledTime: r.scheduled_time,
      queuePosition: r.queue_position ?? null,
      state: r.state,
      estimatedStart: r.estimated_start ?? null,
      estimatedFinish: r.estimated_finish ?? null,
      checkedIn: r.checked_in,
    })),
  };
}

export interface QueueDayAnalytics {
  date: string;
  patientsSeenToday: number;
  averageWaitTime: number;
  averageDelay: number;
  averageQueueLength: number;
  /** Fraction (0-1) of completed consultations started within the "running
   * late" threshold. Null when there were no completed consultations. */
  consultationPunctuality: number | null;
  /** Fraction (0-1) of scheduled working minutes spent in consultation.
   * Null when no schedule blocks exist for the day. */
  doctorUtilization: number | null;
}

interface RawQueueDayAnalytics {
  date: string;
  patients_seen_today: number;
  average_wait_time: number;
  average_delay: number;
  average_queue_length: number;
  consultation_punctuality: number | null;
  doctor_utilization: number | null;
}

export const queueApi = {
  /** GET /api/doctors/{id}/queue/?date= — full ordered timeline for a doctor's day. */
  async doctorQueue(doctorId: number, date?: string): Promise<DoctorQueue> {
    const qs = date ? `?date=${date}` : "";
    const data = await http.get<RawDoctorQueue>(`${endpoints.queue.doctorQueue(doctorId)}${qs}`);
    return toDoctorQueue(data);
  },

  /** GET /api/analytics/queue/?date=&doctor= — staff-only day metrics.
   * Mapped independently of the Dashboard's analyticsApi so this module
   * never depends on (or risks changing) Dashboard-owned code; both call
   * the same real endpoint. */
  async analytics(params?: { date?: string; doctor?: number | string }): Promise<QueueDayAnalytics> {
    const search = new URLSearchParams();
    if (params?.date) search.set("date", params.date);
    if (params?.doctor) search.set("doctor", String(params.doctor));
    const qs = search.toString() ? `?${search.toString()}` : "";
    const d = await http.get<RawQueueDayAnalytics>(`${endpoints.analytics.queue}${qs}`);
    return {
      date: d.date,
      patientsSeenToday: d.patients_seen_today,
      averageWaitTime: d.average_wait_time,
      averageDelay: d.average_delay,
      averageQueueLength: d.average_queue_length,
      consultationPunctuality: d.consultation_punctuality ?? null,
      doctorUtilization: d.doctor_utilization ?? null,
    };
  },

  /** POST /api/appointments/{id}/start/ — staff starts a consultation (requires queue.manage). */
  async startConsultation(appointmentId: number): Promise<void> {
    await http.post(endpoints.queue.startConsultation(appointmentId));
  },
};
