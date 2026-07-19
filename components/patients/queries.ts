"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apptKeys } from "@/components/appointments/queries";
import { appointmentsApi, type CreateAppointmentInput } from "@/lib/api/appointments";
import {
  recordsApi,
  type CreateAllergyInput,
  type CreateMedicationInput,
  type CreatePrescriptionInput,
  type UpdateAllergyInput,
  type UpdateMedicationInput,
  type UpdatePatientRecordInput,
  type UpdatePrescriptionInput,
  type UpdateReportInput,
  type UpdateVisitInput,
  type UpdateVitalsInput,
  type UploadReportInput,
} from "@/lib/api/records";
import { usersApi } from "@/lib/api/users";

export const patientKeys = {
  directory: (search?: string) => ["patients", "directory", search ?? ""] as const,
  profile: (id: number) => ["patients", "profile", id] as const,
  record: (id: number) => ["patients", "record", id] as const,
  visits: (id: number) => ["patients", "visits", id] as const,
  timeline: (id: number) => ["patients", "timeline", id] as const,
};

/** Patients directory: users are the only patient source. Scoped server-side
 * to the "Patient" RBAC role (bug fix — this used to filter client-side on
 * `!user.isStaff`, but `is_staff` is Django's own admin-site flag and is
 * false for every role, so Doctors/Receptionists/Nurses/etc. were
 * incorrectly showing up here too). */
export function usePatients(search?: string) {
  return useQuery({
    queryKey: patientKeys.directory(search),
    queryFn: () => usersApi.list(search, "Patient"),
  });
}

export function usePatientProfile(id: number) {
  return useQuery({
    queryKey: patientKeys.profile(id),
    queryFn: () => usersApi.get(id),
    enabled: Number.isFinite(id),
  });
}

export function usePatientRecord(id: number) {
  return useQuery({
    queryKey: patientKeys.record(id),
    queryFn: () => recordsApi.patientRecord(id),
    enabled: Number.isFinite(id),
  });
}

/** PATCH /api/records/patients/{id}/ — currently updates blood_group only,
 * matching the backend's PatientRecordUpdateSerializer scope. */
export function useUpdatePatientRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { patientId: number; input: UpdatePatientRecordInput }) =>
      recordsApi.updatePatientRecord(vars.patientId, vars.input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: patientKeys.record(vars.patientId) });
    },
  });
}

export function usePatientVisits(id: number) {
  return useQuery({
    queryKey: patientKeys.visits(id),
    queryFn: () => recordsApi.patientVisits(id),
    enabled: Number.isFinite(id),
  });
}

export function usePatientTimeline(id: number) {
  return useQuery({
    queryKey: patientKeys.timeline(id),
    queryFn: () => recordsApi.patientTimeline(id),
    enabled: Number.isFinite(id),
  });
}

// --------------------------------------------------------------------------- //
// Allergy/Medication CRUD (Phase: Admin Patient Clinical Management). Both
// resources are embedded arrays inside the PatientRecord response, so every
// mutation invalidates the same patientKeys.record(patientId) query the
// AllergiesCard/MedicationsCard/PatientProfileCard all already read from —
// one invalidation cascades to all of them, matching the pattern
// useUpdatePatientRecord already established above.
// --------------------------------------------------------------------------- //

export function useCreateAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAllergyInput) => recordsApi.createAllergy(patientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

export function useUpdateAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { allergyId: number; input: UpdateAllergyInput }) =>
      recordsApi.updateAllergy(vars.allergyId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

export function useDeleteAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allergyId: number) => recordsApi.removeAllergy(allergyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

export function useCreateMedication(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMedicationInput) =>
      recordsApi.createMedication(patientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

export function useUpdateMedication(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { medicationId: number; input: UpdateMedicationInput }) =>
      recordsApi.updateMedication(vars.medicationId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

export function useDeleteMedication(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (medicationId: number) => recordsApi.removeMedication(medicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.record(patientId) });
    },
  });
}

// --------------------------------------------------------------------------- //
// Medical Visits (Phase: Admin Medical Visit Management). "Edit Visit" reuses
// the existing VisitNotesView endpoint (not patient-scoped server-side, but
// scoped here to the current patient's cached list/timeline). "Add Visit" is
// not a visit-create call at all — a MedicalVisit can only exist for a
// completed Appointment (enforced by a non-nullable OneToOneField and an
// auto-creation signal), so it reuses the existing appointment-complete
// endpoint via useCompleteAppointment below, which the backend signal turns
// into a visit automatically. No new backend create endpoint exists or is
// needed.
// --------------------------------------------------------------------------- //

export function useUpdateVisitNotes(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { visitId: number; input: UpdateVisitInput }) =>
      recordsApi.updateVisitNotes(vars.visitId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      // Diagnosis/follow_up_date changes must reflect in the timeline —
      // MedicalTimelineService reads directly from the visit, so a fresh
      // fetch (not a cache patch) keeps this exactly in sync.
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

/** The patient's own appointments, reusing the existing admin appointments
 * list (`AdminAppointmentListView`) and its own query key builder
 * (`apptKeys.list`) rather than inventing a parallel key — so this and the
 * main Appointments admin page share cache entries whenever their params
 * happen to match. Used by the Add Visit dialog to show which of a
 * patient's appointments are eligible (confirmed/pending) to complete. */
export function usePatientAppointments(patientId: number) {
  return useQuery({
    queryKey: apptKeys.list({ patient: patientId }),
    queryFn: () => appointmentsApi.adminList({ patient: patientId }),
    enabled: Number.isFinite(patientId),
  });
}

/** POST /api/appointments/{id}/complete/ — the existing endpoint, reused
 * as-is. This is what "Add Visit" actually does: completing an active
 * appointment triggers the backend's post_save signal, which auto-creates
 * the MedicalVisit. Invalidates the patient's visits/timeline (the new
 * visit must appear), the patient's own appointment list (the completed
 * appointment is no longer eligible to complete again), and the broader
 * "appointments" prefix so the main Appointments admin page's status/queue
 * views stay consistent too. */
export function useCompleteAppointment(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { appointmentId: number; actualMinutes?: number }) =>
      appointmentsApi.complete(vars.appointmentId, vars.actualMinutes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
      qc.invalidateQueries({ queryKey: apptKeys.list({ patient: patientId }) });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// --------------------------------------------------------------------------- //
// Follow-up scheduling (Phase: Admin Follow-up & Care Plan). Books a new
// Appointment for this patient via the new admin-facing POST on
// AdminAppointmentListView (appointmentsApi.create) — the same booking
// engine (AppointmentSerializer + BookingService.book()) the patient-facing
// self-service flow already uses, just with an explicit target patient.
// Invalidates exactly the same keys useCompleteAppointment already
// invalidates above: no new query keys are introduced. The new appointment
// itself doesn't touch MedicalVisit/timeline directly (it only does once
// staff later complete it, via the existing "Add Visit" flow), but visits/
// timeline are still invalidated for consistency with that sibling hook.
// --------------------------------------------------------------------------- //

export function useCreateFollowUpAppointment(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
      qc.invalidateQueries({ queryKey: apptKeys.list({ patient: patientId }) });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// --------------------------------------------------------------------------- //
// Prescriptions (Phase: Admin Prescription Management). A Prescription is
// nested under MedicalVisit.prescriptions in the existing visit list
// response (usePatientVisits) — there is no separate prescriptions list
// endpoint, and none is needed, since VisitDetailView/PatientVisitListView
// already embed the full prescriptions array per visit. Every mutation here
// invalidates patientKeys.visits(patientId) (so the visit's embedded array
// refreshes) and patientKeys.timeline(patientId) (MedicalTimelineService
// reads visit.prescriptions.all() directly to build the "prescription"
// timeline stage, so a stale cache would show outdated timeline content).
// --------------------------------------------------------------------------- //

export function useCreatePrescription(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { visitId: number; input: CreatePrescriptionInput }) =>
      recordsApi.createPrescription(vars.visitId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

export function useUpdatePrescription(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { prescriptionId: number; input: UpdatePrescriptionInput }) =>
      recordsApi.updatePrescription(vars.prescriptionId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

export function useDeletePrescription(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId: number) => recordsApi.removePrescription(prescriptionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

// --------------------------------------------------------------------------- //
// Lab Reports (Phase: Admin Lab Report Management). Like Prescriptions, a
// LabReport is nested under MedicalVisit.reports in the existing visit list
// response (usePatientVisits) — no separate reports-list endpoint exists or
// is needed. Upload reuses the pre-existing VisitReportUploadView (multipart,
// gated "emr.upload"); edit/delete use the new LabReportDetailView (gated
// "emr.edit"/"emr.delete" respectively). Every mutation invalidates
// patientKeys.visits(patientId) and patientKeys.timeline(patientId), the
// same pair every other visit-nested mutation above invalidates.
// --------------------------------------------------------------------------- //

export function useUploadReport(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { visitId: number; input: UploadReportInput }) =>
      recordsApi.uploadReport(vars.visitId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

export function useUpdateReport(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { reportId: number; input: UpdateReportInput }) =>
      recordsApi.updateReport(vars.reportId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

export function useDeleteReport(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => recordsApi.removeReport(reportId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}

// --------------------------------------------------------------------------- //
// Vital Signs (Phase: Admin Vital Signs Management). VitalSigns is nested
// under MedicalVisit.vitals in the existing visit list response
// (usePatientVisits), same as prescriptions/reports — no separate vitals
// query exists or is needed. Unlike Prescriptions/Lab Reports there is only
// one mutation: VitalSigns has a OneToOneField to MedicalVisit and is not
// auto-created, so the single PATCH endpoint (VisitVitalsView) both creates
// (first call) and edits (later calls) — no separate create/delete hook.
// Invalidates the same patientKeys.visits/timeline pair every other
// visit-nested mutation above invalidates.
// --------------------------------------------------------------------------- //

export function useUpdateVitals(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { visitId: number; input: UpdateVitalsInput }) =>
      recordsApi.updateVitals(vars.visitId, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.visits(patientId) });
      qc.invalidateQueries({ queryKey: patientKeys.timeline(patientId) });
    },
  });
}
