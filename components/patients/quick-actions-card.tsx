"use client";

import { CalendarPlus, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Quick actions from the Stitch design. No admin "book on behalf of a patient"
 * or "generate report" endpoints exist, so these are presentational and surface
 * a notice rather than fabricating behavior.
 */
export function QuickActionsCard() {
  const notAvailable = () => toast.info("This action isn't available yet.");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" onClick={notAvailable}>
          <CalendarPlus className="size-4" />
          Book Appointment
        </Button>
        <Button variant="outline" className="w-full" onClick={notAvailable}>
          <FileText className="size-4" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}
