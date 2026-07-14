/**
 * Centralized endpoint paths for the Django backend.
 *
 * Kept in one place so feature phases extend a single map rather than
 * scattering string literals. Only auth/session endpoints are needed for the
 * foundation; business endpoints are added per phase.
 */

export const endpoints = {
  auth: {
    token: "/api/auth/token/",
    refresh: "/api/auth/token/refresh/",
    me: "/api/auth/me/",
    myPermissions: "/api/auth/me/permissions/",
  },
  users: {
    list: "/api/auth/users/",
    detail: (id: number) => `/api/auth/users/${id}/`,
    role: (id: number) => `/api/auth/users/${id}/role/`,
  },
  roles: {
    list: "/api/auth/roles/",
  },
  permissions: {
    list: "/api/auth/permissions/",
  },
  billing: {
    analytics: "/api/billing/analytics/",
    invoices: "/api/billing/invoices/",
    invoiceDetail: (id: number) => `/api/billing/invoices/${id}/`,
    invoicePdf: (id: number) => `/api/billing/invoices/${id}/pdf/`,
  },
  analytics: {
    attendance: "/api/analytics/attendance/",
    queue: "/api/analytics/queue/",
  },
  doctors: {
    list: "/api/doctors/",
    detail: (id: number) => `/api/doctors/${id}/`,
    schedules: (doctorId: number) => `/api/doctors/${doctorId}/schedules/`,
    scheduleDetail: (doctorId: number, scheduleId: number) =>
      `/api/doctors/${doctorId}/schedules/${scheduleId}/`,
    leaves: (doctorId: number) => `/api/doctors/${doctorId}/leaves/`,
    leaveDetail: (doctorId: number, leaveId: number) =>
      `/api/doctors/${doctorId}/leaves/${leaveId}/`,
  },
  specialties: {
    list: "/api/specialties/",
  },
  appointments: {
    adminList: "/api/admin/appointments/",
  },
  queue: {
    doctorQueue: (doctorId: number) => `/api/doctors/${doctorId}/queue/`,
    startConsultation: (appointmentId: number) => `/api/appointments/${appointmentId}/start/`,
  },
  records: {
    patient: (id: number) => `/api/records/patients/${id}/`,
    patientVisits: (id: number) => `/api/records/patients/${id}/visits/`,
    patientTimeline: (id: number) => `/api/records/patients/${id}/timeline/`,
  },
  config: {
    hospitalAdmin: "/api/config/admin/hospital/",
    featuresAdminList: "/api/config/admin/features/",
    featureAdminDetail: (key: string) => `/api/config/admin/features/${key}/`,
  },
} as const;
