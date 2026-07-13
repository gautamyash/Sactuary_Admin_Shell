"use client";

import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * "Automate Reminders" panel from the Stitch design. No reminder/notification
 * settings endpoint exists on the backend, so the toggles are presentational
 * (static, non-persisting) rather than wired to fabricated state — matching
 * the "not available yet" convention used for other unbacked actions.
 */
export function RemindersCard() {
  const notAvailable = () =>
    toast.info("Reminder automation isn't connected to a backend endpoint yet.");

  return (
    <div className="flex flex-col justify-between rounded-xl bg-primary p-5 text-primary-foreground">
      <div>
        <h4 className="mb-2 text-base font-semibold">Automate Reminders</h4>
        <p className="mb-6 text-sm opacity-90">
          Reduce outstanding dues by setting up automated email and SMS reminders for patients
          with pending balances.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={notAvailable}
            className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-3 text-left"
          >
            <Mail className="size-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Email Reminders</p>
              <p className="opacity-70">Not configured</p>
            </div>
            <span className="ml-auto h-5 w-10 shrink-0 rounded-full bg-white/20" />
          </button>
          <button
            type="button"
            onClick={notAvailable}
            className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-3 text-left"
          >
            <MessageSquare className="size-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">SMS Notifications</p>
              <p className="opacity-70">Not configured</p>
            </div>
            <span className="ml-auto h-5 w-10 shrink-0 rounded-full bg-white/20" />
          </button>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={notAvailable}
        className="mt-8 w-full bg-white text-primary hover:bg-white/90"
      >
        Configure Settings
      </Button>
    </div>
  );
}
