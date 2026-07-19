"use client";

import { Activity, CalendarClock, FileText, FlaskConical, Pill, Plus } from "lucide-react";
import { useState } from "react";

import { AddVisitDialog } from "@/components/patients/add-visit-dialog";
import { ClinicalNotesDialog } from "@/components/patients/clinical-notes-dialog";
import { FollowUpCarePlanDialog } from "@/components/patients/follow-up-care-plan-dialog";
import { LabReportManagerDialog } from "@/components/patients/lab-report-manager-dialog";
import { PrescriptionManagerDialog } from "@/components/patients/prescription-manager-dialog";
import { VitalSignsManagerDialog } from "@/components/patients/vital-signs-manager-dialog";
import { usePatientVisits } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  confirmed: "default",
  pending: "warning",
  completed: "success",
  cancelled: "destructive",
};

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Medical Visits card for the Patient Detail page's main column (Phase:
 * Admin Medical Visit Management). Reuses usePatientVisits(id) — the same
 * query PatientJourney already reads from (admin-scoped GET
 * /api/records/patients/{id}/visits/, already includes the newly-added
 * read-only visit_type/status fields). Does not touch PatientJourney or its
 * timeline rendering at all.
 *
 * "Add Visit" cannot be a from-scratch create — MedicalVisit has a
 * non-nullable OneToOneField to Appointment and is auto-created by an
 * existing backend signal when an appointment is completed. AddVisitDialog
 * reuses that existing completion endpoint instead of inventing a create
 * endpoint. Delete is intentionally not offered — a visit cascades to
 * prescriptions and lab reports, so removing one would destroy real clinical
 * history.
 *
 * Each row also has a "Prescriptions" action (Phase: Admin Prescription
 * Management) opening PrescriptionManagerDialog scoped to that visit —
 * prescriptions are already embedded on each MedicalVisit from the same
 * usePatientVisits query, so no extra request is issued to view them.
 *
 * And a "Lab Reports" action (Phase: Admin Lab Report Management) opening
 * LabReportManagerDialog, scoped the same way via the visit's already-loaded
 * `reports` array.
 *
 * And a "Vital Signs" action (Phase: Admin Vital Signs Management) opening
 * VitalSignsManagerDialog, scoped via the visit's already-loaded `vitals`
 * field (which may be null if no vitals have been recorded yet — the
 * dialog's form simply starts blank in that case).
 *
 * And a "Clinical Notes" action (Phase: Admin Diagnosis & Care Plan) opening
 * ClinicalNotesDialog — a dedicated, separately-named replacement for what
 * used to be a generic "Edit visit" pencil action. That action already only
 * ever touched chief_complaint/diagnosis/clinical_notes/follow_up_date via
 * the existing VisitNotesView (date/doctor/status are all appointment-
 * derived and read-only), so this is a rename/re-scope for clarity and
 * separation from Prescriptions/Lab Reports/Vital Signs, not a new backend
 * capability.
 *
 * And a "Follow-up & Care Plan" action (Phase: Admin Follow-up & Care Plan)
 * opening FollowUpCarePlanDialog — displays follow_up_date (editable via the
 * same VisitNotesView) with a derived status, a read-only Care Plan section
 * reusing the visit's existing diagnosis/clinical_notes fields, and a
 * "Book follow-up" form that books a real Appointment via the same booking
 * engine the patient-facing self-service flow already uses (no parallel
 * booking system). Separate from Clinical Notes so the two dedicated
 * actions don't overlap in the row.
 */
export function MedicalVisitsCard({ id }: { id: number }) {
  const visits = usePatientVisits(id);
  const [addOpen, setAddOpen] = useState(false);
  const [prescriptionsVisitId, setPrescriptionsVisitId] = useState<number | null>(null);
  const [reportsVisitId, setReportsVisitId] = useState<number | null>(null);
  const [vitalsVisitId, setVitalsVisitId] = useState<number | null>(null);
  const [notesVisitId, setNotesVisitId] = useState<number | null>(null);
  const [followUpVisitId, setFollowUpVisitId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Visits</CardTitle>
        <PermissionGate permission="appointment.edit">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Visit
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="p-0">
        {visits.isLoading ? (
          <div className="p-6">
            <LoadingScreen label="Loading visits…" />
          </div>
        ) : visits.isError ? (
          <div className="p-6">
            <ErrorState error={visits.error} onRetry={() => visits.refetch()} />
          </div>
        ) : (visits.data?.length ?? 0) === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No visits recorded yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Visit Date</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Visit Type</th>
                <th className="px-5 py-3 font-medium">Diagnosis</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visits.data!.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 text-foreground">{formatDate(v.date)}</td>
                  <td className="px-5 py-3 text-foreground">
                    {v.doctorName}
                    {v.specialty !== "—" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({v.specialty})
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{v.visitType ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{v.diagnosis || "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[v.status] ?? "secondary"}>
                      {v.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Prescriptions"
                        onClick={() => setPrescriptionsVisitId(v.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                      >
                        <Pill className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Lab Reports"
                        onClick={() => setReportsVisitId(v.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                      >
                        <FlaskConical className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Vital Signs"
                        onClick={() => setVitalsVisitId(v.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                      >
                        <Activity className="size-4" />
                      </button>
                      <PermissionGate permission="emr.edit">
                        <button
                          type="button"
                          title="Clinical Notes"
                          onClick={() => setNotesVisitId(v.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <FileText className="size-4" />
                        </button>
                      </PermissionGate>
                      <PermissionGate permission="emr.edit">
                        <button
                          type="button"
                          title="Follow-up & Care Plan"
                          onClick={() => setFollowUpVisitId(v.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <CalendarClock className="size-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>

      <AddVisitDialog patientId={id} open={addOpen} onOpenChange={setAddOpen} />
      <ClinicalNotesDialog
        patientId={id}
        visitId={notesVisitId}
        open={notesVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setNotesVisitId(null);
        }}
      />
      <PrescriptionManagerDialog
        patientId={id}
        visitId={prescriptionsVisitId}
        open={prescriptionsVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setPrescriptionsVisitId(null);
        }}
      />
      <LabReportManagerDialog
        patientId={id}
        visitId={reportsVisitId}
        open={reportsVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setReportsVisitId(null);
        }}
      />
      <VitalSignsManagerDialog
        patientId={id}
        visitId={vitalsVisitId}
        open={vitalsVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setVitalsVisitId(null);
        }}
      />
      <FollowUpCarePlanDialog
        patientId={id}
        visitId={followUpVisitId}
        open={followUpVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setFollowUpVisitId(null);
        }}
      />
    </Card>
  );
}
