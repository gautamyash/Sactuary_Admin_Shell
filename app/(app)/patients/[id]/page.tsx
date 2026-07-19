import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AllergiesCard } from "@/components/patients/allergies-card";
import { CurrentVitalsCard } from "@/components/patients/current-vitals-card";
import { MedicalVisitsCard } from "@/components/patients/medical-visits-card";
import { MedicationsCard } from "@/components/patients/medications-card";
import { PatientJourney } from "@/components/patients/patient-journey";
import { PatientProfileCard } from "@/components/patients/patient-profile-card";
import { QuickActionsCard } from "@/components/patients/quick-actions-card";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { PageContainer } from "@/components/layout/page-container";

export default async function PatientJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = Number(id);

  return (
    <PageContainer>
      <PermissionGate
        permission="emr.view"
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the emr.view permission to view patient records."
          />
        }
      >
        <Link
          href="/patients"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to patients
        </Link>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            <PatientProfileCard id={patientId} />
            <CurrentVitalsCard id={patientId} />
            <AllergiesCard id={patientId} />
            <MedicationsCard id={patientId} />
            <QuickActionsCard />
          </div>
          <div className="space-y-6">
            <MedicalVisitsCard id={patientId} />
            <PatientJourney id={patientId} />
          </div>
        </div>
      </PermissionGate>
    </PageContainer>
  );
}
