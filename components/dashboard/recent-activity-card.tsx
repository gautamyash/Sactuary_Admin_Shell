import { Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The Stitch "Recent Activity" feed has no backing endpoint (no activity or
 * audit stream exists). Rendered as an explicit unavailable state rather than
 * fabricating data.
 */
export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No activity feed</p>
          <p className="max-w-[220px] text-xs text-muted-foreground">
            An activity/audit endpoint is required to show recent events.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
