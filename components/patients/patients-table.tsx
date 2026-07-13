"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePatients } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function patientReference(id?: number): string {
  return id ? `#PAT-${String(id).padStart(4, "0")}` : "—";
}

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = usePatients(search.trim() || undefined);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name or email…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-ring"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingScreen label="Loading patients…" />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No patients found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data!.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {patientReference(p.id)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/patients/${p.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        View journey
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
