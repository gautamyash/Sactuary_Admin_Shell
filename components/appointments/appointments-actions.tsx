"use client";

import { Download, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Header actions from the Stitch design. No export, bulk-action, or admin
 * "create appointment on behalf of a patient" endpoints exist, so these are
 * presentational and surface a notice rather than fabricating behavior.
 */
export function AppointmentsActions() {
  const notAvailable = () => toast.info("This action isn't available yet.");
  return (
    <>
      <Button variant="outline" onClick={notAvailable}>
        <Download className="size-4" />
        Export
      </Button>
      <Button variant="outline" onClick={notAvailable}>
        <Layers className="size-4" />
        Bulk Actions
      </Button>
      <Button onClick={notAvailable}>
        <Plus className="size-4" />
        New Appointment
      </Button>
    </>
  );
}
