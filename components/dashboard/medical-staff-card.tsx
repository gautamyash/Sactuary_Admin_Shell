"use client";

import { useDoctors } from "@/components/dashboard/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MedicalStaffCard() {
  const { data, isLoading, isError, error, refetch } = useDoctors();
  const staff = (data ?? []).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Staff</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <LoadingScreen label="Loading staff…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : staff.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No doctors found.</p>
        ) : (
          <ul className="space-y-3">
            {staff.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3">
                <Avatar name={doc.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{doc.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{doc.specialty}</p>
                </div>
                <span
                  className="size-2 rounded-full bg-muted-foreground/40"
                  title="On-site status unavailable"
                />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground/70">
          Live on-site status requires a duty-status endpoint (not available).
        </p>
      </CardContent>
    </Card>
  );
}
