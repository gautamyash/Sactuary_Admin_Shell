import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Minimal inline spinner used by loading states and buttons. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden />;
}

/** Full-area centered loading indicator for route/page loading states. */
export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-6 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
