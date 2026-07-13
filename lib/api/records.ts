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

export const recordsApi = {
  async patientRecord(patientId: number): Promise<PatientRecord> {
    return toPatientRecord(await http.get<RawPatientRecord>(endpoints.records.patient(patientId)));
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
};
