import { HeartPulse } from "lucide-react";

import { siteConfig } from "@/config/site";

/**
 * Authentication layout: a centered, single-column shell used by the login
 * screen (and any future auth flows). Deliberately chrome-free — no sidebar or
 * app header.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <HeartPulse className="size-6" />
        </div>
        <div>
          <p className="text-xl font-bold text-primary">{siteConfig.name}</p>
          <p className="text-sm text-muted-foreground">{siteConfig.hospital}</p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
