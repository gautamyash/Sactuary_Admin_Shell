"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { usePatientProfile, usePatientRecord } from "@/components/patients/queries";
import { patientReference } from "@/components/patients/patients-table";
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PatientProfileCard({ id }: { id: number }) {
  const profile = usePatientProfile(id);
  const record = usePatientRecord(id);
  const [editOpen, setEditOpen] = useState(false);

  if (profile.isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingScreen label="Loading patient…" />
        </CardContent>
      </Card>
    );
  }
  if (profile.isError || !profile.data) {
    return (
      <Card>
        <CardContent>
          <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
        </CardContent>
      </Card>
    );
  }

  const { user } = profile.data;
  const rec = record.data;

  return (
    <Card>
      <CardContent className="relative flex flex-col items-center text-center">
        <PermissionGate permission="user.edit">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Edit patient"
            className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
        </PermissionGate>

        <Avatar name={user.name} className="size-20 text-xl" />
        <p className="mt-3 text-lg font-semibold text-foreground">{user.name}</p>
        <p className="font-mono text-sm text-muted-foreground">ID: {patientReference(user.id)}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {rec?.bloodGroup && <Badge variant="destructive">Blood {rec.bloodGroup}</Badge>}
          {rec?.smokingStatus && <Badge variant="secondary">{rec.smokingStatus}</Badge>}
          {rec && rec.allergies.length > 0 && (
            <Badge variant="warning">
              {rec.allergies.length} allerg{rec.allergies.length === 1 ? "y" : "ies"}
            </Badge>
          )}
          {user.isActive === false && <Badge variant="destructive">Inactive</Badge>}
        </div>
      </CardContent>

      <EditPatientDialog
        patientId={user.id ?? null}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  );
}
