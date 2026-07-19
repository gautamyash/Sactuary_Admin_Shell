"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { AllergyManagerDialog } from "@/components/patients/allergy-manager-dialog";
import { usePatientRecord } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEVERITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  LIFE_THREATENING: "Life-threatening",
};

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  LOW: "secondary",
  MEDIUM: "warning",
  HIGH: "destructive",
  LIFE_THREATENING: "destructive",
};

/** Compact allergies summary for the Patient Detail page's left column,
 * matching CurrentVitalsCard's card shape. Reads from the same
 * usePatientRecord(id) query PatientProfileCard and EditPatientDialog
 * already use (allergies are an embedded array on PatientRecord, not a
 * separate list), so no extra request is issued. Full add/edit/delete lives
 * in AllergyManagerDialog, opened from the pencil action here. */
export function AllergiesCard({ id }: { id: number }) {
  const record = usePatientRecord(id);
  const [managerOpen, setManagerOpen] = useState(false);

  const allergies = record.data?.allergies ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Allergies
        </CardTitle>
        <PermissionGate permission="emr.edit">
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            aria-label="Manage allergies"
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
        ) : allergies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No known allergies.</p>
        ) : (
          <ul className="space-y-2">
            {allergies.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{a.name}</span>
                <Badge variant={SEVERITY_VARIANT[a.severity] ?? "secondary"}>
                  {SEVERITY_LABEL[a.severity] ?? a.severity}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AllergyManagerDialog patientId={id} open={managerOpen} onOpenChange={setManagerOpen} />
    </Card>
  );
}
