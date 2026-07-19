import { PatientsActions } from "@/components/patients/patients-actions";
import { PatientsTable } from "@/components/patients/patients-table";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { PageContainer } from "@/components/layout/page-container";

export default function PatientsPage() {
  return (
    <PageContainer
      title="Patients"
      description="Browse patients and open their clinical journey."
      actions={<PatientsActions />}
    >
      <PermissionGate
        anyOf={["user.view", "emr.view"]}
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the user.view (directory) and emr.view (records) permissions to view patients."
          />
        }
      >
        <PatientsTable />
      </PermissionGate>
    </PageContainer>
  );
}
