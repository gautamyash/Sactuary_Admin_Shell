import type { ReactNode } from "react";

/** Shared input styling — lifted verbatim from
 * components/doctors/doctor-form-dialog.tsx so every hand-rolled form in the
 * admin panel (doctor onboarding, hospital settings) looks identical. */
export const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring disabled:cursor-not-allowed disabled:opacity-60";
export const textareaClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring disabled:cursor-not-allowed disabled:opacity-60";
export const labelClass = "text-sm font-medium text-foreground";

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
