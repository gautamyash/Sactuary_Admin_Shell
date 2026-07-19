import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface Allergy {
  id: number;
  name: string;
  severity: string;
  notes?: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
}

export interface PatientRecord {
  id: number;
  bloodGroup?: string;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  smokingStatus?: string;
  alcohol?: string;
  pregnant: boolean | null;
  emergencyContact?: string;
  allergies: Allergy[];
  medications: Medication[];
}

export interface VitalSigns {
  temperature: number | null;
  pulse: number | null;
  bloodPressure?: string;
  oxygen: number | null;
  respiration: number | null;
  bloodSugar: number | null;
  /** Phase: Admin Vital Signs Management — weight/height already existed on
   * the backend's VitalSignsSerializer but were never surfaced here. Added
   * additively; no backend change. There is no BMI field on VitalSigns
   * (BMI only exists on the unrelated, patient-level PatientRecord model),
   * so it is not represented here either. */
  weight: number | null;
  height: number | null;
}

export interface Prescription {
  id: number;
  medicine: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface LabReport {
  id: number;
  title: string;
  fileUrl: string | null;
  uploadedAt: string;
}

export interface MedicalVisit {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  /** Sourced from the related Appointment (no such field on MedicalVisit
   * itself) — same pattern as date/time above. Null when the appointment
   * has no visit type set. Phase: Admin Medical Visit Management. */
  visitType: string | null;
  /** Sourced from the related Appointment's status (confirmed/pending/
   * completed/cancelled). Phase: Admin Medical Visit Management. */
  status: string;
  chiefComplaint?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  followUpDate: string | null;
  createdAt: string;
  vitals: VitalSigns | null;
  prescriptions: Prescription[];
  reports: LabReport[];
}

export interface TimelineEvent {
  stage: string;
  title: string;
  timestamp: string | null;
  detail: string | null;
  visitId: number;
}

interface RawAllergy {
  id: number;
  name: string;
  severity: string;
  notes: string;
}
interface RawMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}
interface RawVitals {
  temperature: number | null;
  pulse: number | null;
  blood_pressure: string;
  oxygen: number | null;
  respiration: number | null;
  blood_sugar: number | null;
  weight: number | null;
  height: number | null;
}
interface RawPrescription {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}
interface RawLabReport {
  id: number;
  title: string;
  file_url: string | null;
  uploaded_at: string;
}
interface RawVisit {
  id: number;
  doctor_detail: { name: string; specialty: string } | null;
  date: string;
  time: string;
  visit_type: string | null;
  status: string;
  chief_complaint: string;
  diagnosis: string;
  clinical_notes: string;
  follow_up_date: string | null;
  created_at: string;
  vitals: RawVitals | null;
  prescriptions: RawPrescription[];
  reports: RawLabReport[];
}
interface RawPatientRecord {
  id: number;
  blood_group: string;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  smoking_status: string;
  alcohol: string;
  pregnant: boolean | null;
  emergency_contact: string;
  allergies: RawAllergy[];
  medications: RawMedication[];
}
interface RawTimelineEvent {
  stage: string;
  title: string;
  timestamp: string | null;
  detail: string | null;
  visit_id: number;
}

const toAllergy = (a: RawAllergy): Allergy => ({
  id: a.id,
  name: a.name,
  severity: a.severity,
  notes: a.notes || undefined,
});
const toMedication = (m: RawMedication): Medication => ({
  id: m.id,
  name: m.name,
  dosage: m.dosage || undefined,
  frequency: m.frequency || undefined,
  startDate: m.start_date,
  endDate: m.end_date,
  active: m.active,
});
const toVitals = (v: RawVitals | null): VitalSigns | null =>
  v
    ? {
        temperature: v.temperature,
        pulse: v.pulse,
        bloodPressure: v.blood_pressure || undefined,
        oxygen: v.oxygen,
        respiration: v.respiration,
        bloodSugar: v.blood_sugar,
        weight: v.weight,
        height: v.height,
      }
    : null;
const toPrescription = (p: RawPrescription): Prescription => ({
  id: p.id,
  medicine: p.medicine,
  dosage: p.dosage || undefined,
  frequency: p.frequency || undefined,
  duration: p.duration || undefined,
  instructions: p.instructions || undefined,
});
const toLabReport = (r: RawLabReport): LabReport => ({
  id: r.id,
  title: r.title,
  fileUrl: r.file_url,
  uploadedAt: r.uploaded_at,
});
const toVisit = (v: RawVisit): MedicalVisit => ({
  id: v.id,
  doctorName: v.doctor_detail?.name ?? "—",
  specialty: v.doctor_detail?.specialty ?? "—",
  date: v.date,
  time: v.time,
  visitType: v.visit_type,
  status: v.status,
  chiefComplaint: v.chief_complaint || undefined,
  diagnosis: v.diagnosis || undefined,
  clinicalNotes: v.clinical_notes || undefined,
  followUpDate: v.follow_up_date,
  createdAt: v.created_at,
  vitals: toVitals(v.vitals),
  prescriptions: (v.prescriptions ?? []).map(toPrescription),
  reports: (v.reports ?? []).map(toLabReport),
});
const toPatientRecord = (r: RawPatientRecord): PatientRecord => ({
  id: r.id,
  bloodGroup: r.blood_group || undefined,
  heightCm: r.height_cm,
  weightKg: r.weight_kg,
  bmi: r.bmi,
  smokingStatus: r.smoking_status || undefined,
  alcohol: r.alcohol || undefined,
  pregnant: r.pregnant,
  emergencyContact: r.emergency_contact || undefined,
  allergies: (r.allergies ?? []).map(toAllergy),
  medications: (r.medications ?? []).map(toMedication),
});
const toTimelineEvent = (e: RawTimelineEvent): TimelineEvent => ({
  stage: e.stage,
  title: e.title,
  timestamp: e.timestamp,
  detail: e.detail,
  visitId: e.visit_id,
});

/** Input for PATCH /api/records/patients/{patient_id}/ (admin/staff edit,
 * gated server-side on "emr.edit"). Mirrors the backend's
 * `PatientRecordUpdateSerializer` (Phase: Admin Patient Edit workflow —
 * extended from `blood_group` only to every PatientRecord field the Edit
 * Patient dialog needs; `bmi` stays out, it's derived server-side). */
export interface UpdatePatientRecordInput {
  bloodGroup?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  smokingStatus?: string;
  alcohol?: string;
  pregnant?: boolean | null;
  emergencyContact?: string;
}

/** Input for POST /api/records/patients/{patient_id}/allergies/ and PATCH
 * /api/records/allergies/{id}/ (admin/staff, gated server-side on
 * "emr.edit"). Mirrors the backend's `AllergyWriteSerializer` — same shape
 * used for both create and edit, with every field optional on edit via
 * `partial=True` server-side. Phase: Admin Patient Clinical Management. */
export interface CreateAllergyInput {
  name: string;
  severity?: string;
  notes?: string;
}
export type UpdateAllergyInput = Partial<CreateAllergyInput>;

/** Input for POST /api/records/patients/{patient_id}/medications/ and PATCH
 * /api/records/medications/{id}/ (admin/staff, gated server-side on
 * "emr.edit"). Mirrors the backend's `MedicationWriteSerializer`. Phase:
 * Admin Patient Clinical Management. */
export interface CreateMedicationInput {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
}
export type UpdateMedicationInput = Partial<CreateMedicationInput>;

/** Input for POST /api/records/visits/{id}/notes/ (VisitNotesView). Not a
 * new endpoint — this already exists, is gated server-side on "emr.edit",
 * and is not patient-scoped (any emr.edit holder may edit any visit), so
 * "Edit Visit" in the Admin Panel reuses it as-is. Mirrors the backend's
 * `DoctorNotesSerializer`. Phase: Admin Medical Visit Management. */
export interface UpdateVisitInput {
  chiefComplaint?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  followUpDate?: string | null;
}

/** Input for POST /api/records/visits/{id}/prescriptions/ (VisitPrescriptionView,
 * pre-existing, gated server-side on "emr.prescription") and PATCH
 * /api/records/prescriptions/{id}/ (new PrescriptionDetailView, same
 * permission, Phase: Admin Prescription Management). Mirrors the backend's
 * `PrescriptionWriteSerializer` — same shape for create and edit, with every
 * field optional on edit via `partial=True` server-side. */
export interface CreatePrescriptionInput {
  medicine: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}
export type UpdatePrescriptionInput = Partial<CreatePrescriptionInput>;

/** Input for POST /api/records/visits/{id}/reports/ (VisitReportUploadView,
 * pre-existing multipart upload, gated server-side on "emr.upload") and
 * PATCH /api/records/reports/{id}/ (new LabReportDetailView, gated
 * "emr.edit", Phase: Admin Lab Report Management).
 *
 * LabReport only has title/file/uploaded_at/uploaded_by as real fields —
 * there is no test_name/status/ordered_date/result_date/summary anywhere in
 * the backend schema, so none of those are represented here. `title` is the
 * only field either endpoint accepts as input (LabReportUploadSerializer
 * requires title+file on create; LabReportSerializer only has `title`
 * writable on edit — id/file_url/uploaded_at are all read-only there). */
export interface UploadReportInput {
  title: string;
  file: File;
}
export interface UpdateReportInput {
  title: string;
}

/** Input for PATCH /api/records/visits/{id}/vitals/ (new VisitVitalsView,
 * Phase: Admin Vital Signs Management, gated server-side on "emr.edit").
 * This single endpoint both creates (first call, get_or_create server-side)
 * and edits (later calls) a visit's vitals — VitalSigns has a OneToOneField
 * to MedicalVisit and is not auto-created, so there is no separate create
 * endpoint. Mirrors the backend's VitalSignsSerializer fields exactly —
 * every field optional, since the form may only touch some of them
 * (partial=True server-side). No `bmi` — it doesn't exist on this model. */
export interface UpdateVitalsInput {
  temperature?: number | null;
  pulse?: number | null;
  bloodPressure?: string;
  oxygen?: number | null;
  respiration?: number | null;
  bloodSugar?: number | null;
  weight?: number | null;
  height?: number | null;
}

export const recordsApi = {
  async patientRecord(patientId: number): Promise<PatientRecord> {
    return toPatientRecord(await http.get<RawPatientRecord>(endpoints.records.patient(patientId)));
  },
  async updatePatientRecord(
    patientId: number,
    input: UpdatePatientRecordInput,
  ): Promise<PatientRecord> {
    const body: Record<string, unknown> = {};
    if (input.bloodGroup !== undefined) body.blood_group = input.bloodGroup;
    if (input.heightCm !== undefined) body.height_cm = input.heightCm;
    if (input.weightKg !== undefined) body.weight_kg = input.weightKg;
    if (input.smokingStatus !== undefined) body.smoking_status = input.smokingStatus;
    if (input.alcohol !== undefined) body.alcohol = input.alcohol;
    if (input.pregnant !== undefined) body.pregnant = input.pregnant;
    if (input.emergencyContact !== undefined) body.emergency_contact = input.emergencyContact;
    return toPatientRecord(
      await http.patch<RawPatientRecord>(endpoints.records.patient(patientId), body),
    );
  },
  async patientVisits(patientId: number): Promise<MedicalVisit[]> {
    const data = await http.get<{ results: RawVisit[] }>(
      endpoints.records.patientVisits(patientId),
    );
    return (data.results ?? []).map(toVisit);
  },
  async patientTimeline(patientId: number): Promise<TimelineEvent[]> {
    const data = await http.get<{ timeline: RawTimelineEvent[] }>(
      endpoints.records.patientTimeline(patientId),
    );
    return (data.timeline ?? []).map(toTimelineEvent);
  },

  async createAllergy(patientId: number, input: CreateAllergyInput): Promise<Allergy> {
    const body: Record<string, unknown> = { name: input.name };
    if (input.severity !== undefined) body.severity = input.severity;
    if (input.notes !== undefined) body.notes = input.notes;
    return toAllergy(
      await http.post<RawAllergy>(endpoints.records.patientAllergies(patientId), body),
    );
  },
  async updateAllergy(allergyId: number, input: UpdateAllergyInput): Promise<Allergy> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.severity !== undefined) body.severity = input.severity;
    if (input.notes !== undefined) body.notes = input.notes;
    return toAllergy(
      await http.patch<RawAllergy>(endpoints.records.allergyDetail(allergyId), body),
    );
  },
  async removeAllergy(allergyId: number): Promise<void> {
    await http.delete<void>(endpoints.records.allergyDetail(allergyId));
  },

  async createMedication(
    patientId: number,
    input: CreateMedicationInput,
  ): Promise<Medication> {
    const body: Record<string, unknown> = { name: input.name };
    if (input.dosage !== undefined) body.dosage = input.dosage;
    if (input.frequency !== undefined) body.frequency = input.frequency;
    if (input.startDate !== undefined) body.start_date = input.startDate;
    if (input.endDate !== undefined) body.end_date = input.endDate;
    if (input.active !== undefined) body.active = input.active;
    return toMedication(
      await http.post<RawMedication>(
        endpoints.records.patientMedications(patientId),
        body,
      ),
    );
  },
  async updateMedication(
    medicationId: number,
    input: UpdateMedicationInput,
  ): Promise<Medication> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.dosage !== undefined) body.dosage = input.dosage;
    if (input.frequency !== undefined) body.frequency = input.frequency;
    if (input.startDate !== undefined) body.start_date = input.startDate;
    if (input.endDate !== undefined) body.end_date = input.endDate;
    if (input.active !== undefined) body.active = input.active;
    return toMedication(
      await http.patch<RawMedication>(
        endpoints.records.medicationDetail(medicationId),
        body,
      ),
    );
  },
  async removeMedication(medicationId: number): Promise<void> {
    await http.delete<void>(endpoints.records.medicationDetail(medicationId));
  },

  async updateVisitNotes(visitId: number, input: UpdateVisitInput): Promise<MedicalVisit> {
    const body: Record<string, unknown> = {};
    if (input.chiefComplaint !== undefined) body.chief_complaint = input.chiefComplaint;
    if (input.diagnosis !== undefined) body.diagnosis = input.diagnosis;
    if (input.clinicalNotes !== undefined) body.clinical_notes = input.clinicalNotes;
    if (input.followUpDate !== undefined) body.follow_up_date = input.followUpDate;
    return toVisit(await http.post<RawVisit>(endpoints.records.visitNotes(visitId), body));
  },

  async createPrescription(
    visitId: number,
    input: CreatePrescriptionInput,
  ): Promise<Prescription> {
    const body: Record<string, unknown> = { medicine: input.medicine };
    if (input.dosage !== undefined) body.dosage = input.dosage;
    if (input.frequency !== undefined) body.frequency = input.frequency;
    if (input.duration !== undefined) body.duration = input.duration;
    if (input.instructions !== undefined) body.instructions = input.instructions;
    return toPrescription(
      await http.post<RawPrescription>(endpoints.records.visitPrescriptions(visitId), body),
    );
  },
  async updatePrescription(
    prescriptionId: number,
    input: UpdatePrescriptionInput,
  ): Promise<Prescription> {
    const body: Record<string, unknown> = {};
    if (input.medicine !== undefined) body.medicine = input.medicine;
    if (input.dosage !== undefined) body.dosage = input.dosage;
    if (input.frequency !== undefined) body.frequency = input.frequency;
    if (input.duration !== undefined) body.duration = input.duration;
    if (input.instructions !== undefined) body.instructions = input.instructions;
    return toPrescription(
      await http.patch<RawPrescription>(
        endpoints.records.prescriptionDetail(prescriptionId),
        body,
      ),
    );
  },
  async removePrescription(prescriptionId: number): Promise<void> {
    await http.delete<void>(endpoints.records.prescriptionDetail(prescriptionId));
  },

  async uploadReport(visitId: number, input: UploadReportInput): Promise<LabReport> {
    const form = new FormData();
    form.append("title", input.title);
    form.append("file", input.file);
    return toLabReport(
      await http.post<RawLabReport>(endpoints.records.visitReports(visitId), form),
    );
  },
  async updateReport(reportId: number, input: UpdateReportInput): Promise<LabReport> {
    return toLabReport(
      await http.patch<RawLabReport>(endpoints.records.reportDetail(reportId), {
        title: input.title,
      }),
    );
  },
  async removeReport(reportId: number): Promise<void> {
    await http.delete<void>(endpoints.records.reportDetail(reportId));
  },

  async updateVitals(visitId: number, input: UpdateVitalsInput): Promise<VitalSigns> {
    const body: Record<string, unknown> = {};
    if (input.temperature !== undefined) body.temperature = input.temperature;
    if (input.pulse !== undefined) body.pulse = input.pulse;
    if (input.bloodPressure !== undefined) body.blood_pressure = input.bloodPressure;
    if (input.oxygen !== undefined) body.oxygen = input.oxygen;
    if (input.respiration !== undefined) body.respiration = input.respiration;
    if (input.bloodSugar !== undefined) body.blood_sugar = input.bloodSugar;
    if (input.weight !== undefined) body.weight = input.weight;
    if (input.height !== undefined) body.height = input.height;
    const raw = await http.patch<RawVitals>(endpoints.records.visitVitals(visitId), body);
    return toVitals(raw) as VitalSigns;
  },
};
