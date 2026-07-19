"use client";

import { Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import {
  useAttendanceAnalytics,
  useBillingAnalytics,
  useDoctors,
  useQueueAnalytics,
  useTodayAppointments,
  todayISO,
} from "@/components/dashboard/queries";
import { Button } from "@/components/ui/button";
import { downloadCsv, type CsvRow } from "@/lib/export/csv";

/**
 * Header actions from the Stitch design.
 *
 * "New Appointment" opens NewAppointmentDialog, which books through the
 * existing admin appointment-creation flow (AdminAppointmentListView POST) —
 * the same flow FollowUpCarePlanDialog already uses, just not scoped to a
 * single patient ahead of time.
 *
 * "Export Report" has no dedicated backend export endpoint to call: the
 * Dashboard's numbers already come from three existing analytics endpoints
 * (billing/attendance/queue) plus the admin appointments list, each reused
 * here via the Dashboard's own React Query hooks (same cache the KPI/Revenue/
 * Queue cards use — clicking Export triggers no extra requests if those cards
 * already loaded). Rendering that data as a CSV in the browser reuses the
 * existing reporting data with no duplicated aggregation logic and no new
 * backend surface.
 */
export function DashboardActions() {
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);

  const billing = useBillingAnalytics();
  const attendance = useAttendanceAnalytics();
  const queue = useQueueAnalytics();
  const doctors = useDoctors();
  const todayAppointments = useTodayAppointments();

  function exportReport() {
    if (billing.isLoading || attendance.isLoading || queue.isLoading) {
      toast.info("Report data is still loading — try again in a moment.");
      return;
    }
    const rows: CsvRow[] = [["Metric", "Value"]];

    rows.push(["Date", todayISO()]);
    rows.push(["Active doctors", (doctors.data ?? []).length]);
    rows.push(["Appointments today", (todayAppointments.data ?? []).length]);

    if (billing.data) {
      rows.push(["Today's revenue", billing.data.todayRevenue]);
      rows.push(["Weekly revenue", billing.data.weeklyRevenue]);
      rows.push(["Monthly revenue", billing.data.monthlyRevenue]);
      rows.push(["Pending payments", billing.data.pendingPayments]);
      rows.push(["Refunds", billing.data.refunds]);
      rows.push(["Collection rate (%)", billing.data.collectionRate]);
      rows.push(["Average invoice", billing.data.averageInvoice]);
    }
    if (attendance.data) {
      rows.push(["Average no-show rate (%)", attendance.data.averageNoShowRate]);
      rows.push(["High-risk patients", attendance.data.highRiskPatients]);
      rows.push(["Appointments confirmed", attendance.data.appointmentsConfirmed]);
      rows.push(["Appointments no-show", attendance.data.appointmentsNoShow]);
      rows.push(["Prediction accuracy (%)", attendance.data.predictionAccuracy]);
      rows.push(["Predicted no-shows", attendance.data.predictedNoShows]);
    }
    if (queue.data) {
      rows.push(["Patients seen today", queue.data.patientsSeenToday]);
      rows.push(["Average wait time (min)", queue.data.averageWaitTime]);
      rows.push(["Average delay (min)", queue.data.averageDelay]);
      rows.push(["Average queue length", queue.data.averageQueueLength]);
    }

    downloadCsv(`hospital-report-${todayISO()}.csv`, rows);
    toast.success("Report exported.");
  }

  return (
    <>
      <Button variant="outline" onClick={exportReport}>
        <Download className="size-4" />
        Export Report
      </Button>
      <Button onClick={() => setNewAppointmentOpen(true)}>
        <Plus className="size-4" />
        New Appointment
      </Button>
      <NewAppointmentDialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen} />
    </>
  );
}
