"use client";

import { FileDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Header actions from the Stitch design. No report-export or
 * create-invoice-from-scratch endpoint exists on the backend (only
 * POST .../items/ to add a line item to an already-created invoice), so
 * these are presentational and surface a notice rather than fabricating
 * behavior — same convention as AppointmentsActions.
 */
export function BillingActions() {
  const notAvailable = () => toast.info("This action isn't available yet.");
  return (
    <>
      <Button variant="outline" onClick={notAvailable}>
        <FileDown className="size-4" />
        Export Report
      </Button>
      <Button onClick={notAvailable}>
        <Plus className="size-4" />
        Generate New Invoice
      </Button>
    </>
  );
}
