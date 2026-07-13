"use client";

import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Header actions from the Stitch design. Neither an export nor an admin
 * "create appointment on behalf of a patient" endpoint exists yet, so these
 * are presentational and surface a notice rather than fabricating behavior.
 */
export function DashboardActions() {
  const notAvailable = () => toast.info("This action isn't available yet.");
  return (
    <>
      <Button variant="outline" onClick={notAvailable}>
        <Download className="size-4" />
        Export Report
      </Button>
      <Button onClick={notAvailable}>
        <Plus className="size-4" />
        New Appointment
      </Button>
    </>
  );
}
