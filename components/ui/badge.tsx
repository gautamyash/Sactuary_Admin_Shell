import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/12 text-emerald-600",
  warning: "bg-amber-500/15 text-amber-600",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
