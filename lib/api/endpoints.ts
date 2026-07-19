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
    resetPassword: (id: number) => `/api/auth/users/${id}/reset-password/`,
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
    complete: (id: number) => `/api/appointments/${id}/complete/`,
  },
  queue: {
    doctorQueue: (doctorId: number) => `/api/doctors/${doctorId}/queue/`,
    startConsultation: (appointmentId: number) => `/api/appointments/${appointmentId}/start/`,
  },
  records: {
    patient: (id: number) => `/api/records/patients/${id}/`,
    patientVisits: (id: number) => `/api/records/patients/${id}/visits/`,
    patientTimeline: (id: number) => `/api/records/patients/${id}/timeline/`,
    patientAllergies: (patientId: number) =>
      `/api/records/patients/${patientId}/allergies/`,
    allergyDetail: (allergyId: number) => `/api/records/allergies/${allergyId}/`,
    patientMedications: (patientId: number) =>
      `/api/records/patients/${patientId}/medications/`,
    medicationDetail: (medicationId: number) =>
      `/api/records/medications/${medicationId}/`,
    visitNotes: (visitId: number) => `/api/records/visits/${visitId}/notes/`,
    visitPrescriptions: (visitId: number) => `/api/records/visits/${visitId}/prescriptions/`,
    prescriptionDetail: (prescriptionId: number) =>
      `/api/records/prescriptions/${prescriptionId}/`,
    visitReports: (visitId: number) => `/api/records/visits/${visitId}/reports/`,
    reportDetail: (reportId: number) => `/api/records/reports/${reportId}/`,
    visitVitals: (visitId: number) => `/api/records/visits/${visitId}/vitals/`,
  },
  config: {
    hospitalAdmin: "/api/config/admin/hospital/",
    featuresAdminList: "/api/config/admin/features/",
    featureAdminDetail: (key: string) => `/api/config/admin/features/${key}/`,
  },
} as const;
