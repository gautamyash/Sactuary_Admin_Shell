"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { CreatePatientDialog } from "@/components/patients/create-patient-dialog";

/**
 * "New Patient" entry point for the Patients page header. Mirrors
 * DoctorsActions' PermissionGate + icon Button pattern exactly.
 *
 * Gated on "user.create" rather than a "patient.create" code: the backend's
 * RBAC permission catalog has no patient-specific permissions at all (only
 * appointment.*, emr.*, billing.*, queue.*, attendance.*, analytics.*,
 * user.*, settings.*, reports.*, system.admin) — patient accounts are
 * created through the same generic admin user-creation flow as every other
 * role, gated on "user.create" there too (see users-table.tsx).
 *
 * Opens CreatePatientDialog, which is UI-only for this phase — no API call
 * exists yet, so submitting there just announces the next phase.
 */
export function PatientsActions() {
  const [open, setOpen] = useState(false);

  return (
    <PermissionGate permission="user.create">
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New Patient
      </Button>
      <CreatePatientDialog open={open} onOpenChange={setOpen} />
    </PermissionGate>
  );
}
