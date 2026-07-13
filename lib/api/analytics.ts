import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface BillingAnalytics {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  refunds: number;
  collectionRate: number;
  averageInvoice: number;
  paymentMethods: { method: string; total: number }[];
  topServices: { description: string; total: number }[];
}

interface RawBillingAnalytics {
  today_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  refunds: number;
  collection_rate: number;
  average_invoice: number;
  payment_methods: { method: string; total: number }[];
  top_services: { description: string; total: number }[];
}

export interface AttendanceAnalytics {
  averageNoShowRate: number;
  highRiskPatients: number;
  appointmentsConfirmed: number;
  appointmentsNoShow: number;
  predictionAccuracy: number;
  predictedNoShows: number;
}

interface RawAttendanceAnalytics {
  average_no_show_rate: number;
  high_risk_patients: number;
  appointments_confirmed: number;
  appointments_no_show: number;
  prediction_accuracy: number;
  predicted_no_shows: number;
}

export interface QueueAnalytics {
  date: string;
  patientsSeenToday: number;
  averageWaitTime: number;
  averageDelay: number;
  averageQueueLength: number;
}

interface RawQueueAnalytics {
  date: string;
  patients_seen_today: number;
  average_wait_time: number;
  average_delay: number;
  average_queue_length: number;
}

export const analyticsApi = {
  async billing(): Promise<BillingAnalytics> {
    const d = await http.get<RawBillingAnalytics>(endpoints.billing.analytics);
    return {
      todayRevenue: d.today_revenue,
      weeklyRevenue: d.weekly_revenue,
      monthlyRevenue: d.monthly_revenue,
      pendingPayments: d.pending_payments,
      refunds: d.refunds,
      collectionRate: d.collection_rate,
      averageInvoice: d.average_invoice,
      paymentMethods: d.payment_methods ?? [],
      topServices: d.top_services ?? [],
    };
  },

  async attendance(): Promise<AttendanceAnalytics> {
    const d = await http.get<RawAttendanceAnalytics>(endpoints.analytics.attendance);
    return {
      averageNoShowRate: d.average_no_show_rate,
      highRiskPatients: d.high_risk_patients,
      appointmentsConfirmed: d.appointments_confirmed,
      appointmentsNoShow: d.appointments_no_show,
      predictionAccuracy: d.prediction_accuracy,
      predictedNoShows: d.predicted_no_shows,
    };
  },

  async queue(date?: string): Promise<QueueAnalytics> {
    const qs = date ? `?date=${date}` : "";
    const d = await http.get<RawQueueAnalytics>(`${endpoints.analytics.queue}${qs}`);
    return {
      date: d.date,
      patientsSeenToday: d.patients_seen_today,
      averageWaitTime: d.average_wait_time,
      averageDelay: d.average_delay,
      averageQueueLength: d.average_queue_length,
    };
  },
};
