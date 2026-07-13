"use client";

import {
  CalendarDays,
  Clock,
  CreditCard,
  DollarSign,
  FlaskConical,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import {
  useAttendanceAnalytics,
  useBillingAnalytics,
  useDoctors,
  useQueueAnalytics,
  useTodayAppointments,
} from "@/components/dashboard/queries";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export function KpiSection() {
  const appts = useTodayAppointments();
  const queue = useQueueAnalytics();
  const doctors = useDoctors();
  const billing = useBillingAnalytics();
  const attendance = useAttendanceAnalytics();

  const attendanceRate =
    attendance.data != null ? Math.max(0, 100 - attendance.data.averageNoShowRate) : undefined;
  const avgWait = queue.data?.averageWaitTime;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Today's Appointments"
        icon={CalendarDays}
        loading={appts.isLoading}
        error={appts.isError}
        value={appts.data ? String(appts.data.length) : undefined}
        hint={appts.data ? "Scheduled today" : undefined}
        hintTone="muted"
      />
      <StatCard
        label="Patients Today"
        icon={Users}
        loading={queue.isLoading}
        error={queue.isError}
        value={queue.data ? String(queue.data.patientsSeenToday) : undefined}
        hint="Seen today"
        hintTone="muted"
      />
      <StatCard
        label="Doctors Available"
        icon={Stethoscope}
        loading={doctors.isLoading}
        error={doctors.isError}
        value={doctors.data ? String(doctors.data.length) : undefined}
        hint="On staff (duty status unavailable)"
        hintTone="muted"
      />
      <StatCard
        label="Avg Wait Time"
        icon={Clock}
        loading={queue.isLoading}
        error={queue.isError}
        value={avgWait != null ? `${Math.round(avgWait)} min` : undefined}
        accent={avgWait != null && avgWait >= 20}
        hint={avgWait != null ? "Today's average" : undefined}
        hintTone="muted"
      />
      <StatCard
        label="Today's Revenue"
        icon={DollarSign}
        loading={billing.isLoading}
        error={billing.isError}
        value={billing.data ? money(billing.data.todayRevenue) : undefined}
        hint={billing.data ? `${billing.data.collectionRate}% collection rate` : undefined}
        hintTone="up"
      />
      <StatCard
        label="Pending Payments"
        icon={CreditCard}
        loading={billing.isLoading}
        error={billing.isError}
        value={billing.data ? money(billing.data.pendingPayments) : undefined}
        hint="Outstanding balance"
        hintTone="muted"
      />
      <StatCard
        label="Lab Reports Pending"
        icon={FlaskConical}
        unavailable="No endpoint available"
      />
      <StatCard
        label="Attendance Rate"
        icon={UserCheck}
        loading={attendance.isLoading}
        error={attendance.isError}
        value={attendanceRate != null ? `${attendanceRate.toFixed(0)}%` : undefined}
        hint={attendanceRate != null ? "Attended vs no-show" : undefined}
        hintTone="up"
      />
    </div>
  );
}
