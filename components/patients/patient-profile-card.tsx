"use client";

import { usePatientProfile, usePatientRecord } from "@/components/patients/queries";
import { patientReference } from "@/components/patients/patients-table";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function PatientProfileCard({ id }: { id: number }) {
  const profile = usePatientProfile(id);
  const record = usePatientRecord(id);

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
      <CardContent className="flex flex-col items-center text-center">
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
        </div>
      </CardContent>
    </Card>
  );
}
