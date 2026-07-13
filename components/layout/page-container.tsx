import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  title?: string;
  description?: string;
  /** Optional actions rendered on the right of the page header (buttons, etc.). */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Reusable page scaffold. Provides the consistent max-width, padding, and
 * page-header (title + description + actions) treatment from the Stitch
 * reference. Every business screen composes its content inside this.
 */
export function PageContainer({
  title,
  description,
  actions,
  className,
  children,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8", className)}>
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {title}
              </h1>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
