"use client";

import { Plus } from "lucide-react";

import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";

export function DoctorsActions({ onOnboard }: { onOnboard: () => void }) {
  return (
    <PermissionGate permission="system.admin">
      <Button onClick={onOnboard}>
        <Plus className="size-4" />
        Onboard New Doctor
      </Button>
    </PermissionGate>
  );
}
