"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { MedicationManagerDialog } from "@/components/patients/medication-manager-dialog";
import { usePatientRecord } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Compact medications summary for the Patient Detail page's left column,
 * matching CurrentVitalsCard/AllergiesCard's card shape. Reads from the same
 * usePatientRecord(id) query PatientProfileCard and EditPatientDialog
 * already use (medications are an embedded array on PatientRecord, not a
 * separate list), so no extra request is issued. Full add/edit/delete lives
 * in MedicationManagerDialog, opened from the pencil action here. */
export function MedicationsCard({ id }: { id: number }) {
  const record = usePatientRecord(id);
  const [managerOpen, setManagerOpen] = useState(false);

  const medications = record.data?.medications ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Current Medications
        </CardTitle>
        <PermissionGate permission="emr.edit">
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            aria-label="Manage medications"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
        </PermissionGate>
      </CardHeader>
      <CardContent>
        {record.isLoading ? (
          <p className="py-2 text-sm text-muted-foreground">Loading…</p>
        ) : record.isError ? (
          <ErrorState error={record.error} onRetry={() => record.refetch()} />
        ) : medications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No medications recorded.</p>
        ) : (
          <ul className="space-y-2">
            {medications.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{m.name}</span>
                {m.dosage && (
                  <span className="text-xs text-muted-foreground">{m.dosage}</span>
                )}
                <Badge variant={m.active ? "success" : "secondary"}>
                  {m.active ? "Active" : "Inactive"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <MedicationManagerDialog patientId={id} open={managerOpen} onOpenChange={setManagerOpen} />
    </Card>
  );
}
