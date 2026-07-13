"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/common/spinner";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value?: string;
  icon: LucideIcon;
  hint?: string;
  hintTone?: "up" | "down" | "muted";
  accent?: boolean;
  loading?: boolean;
  error?: boolean;
  /** When set, the metric has no backing endpoint and is shown as unavailable. */
  unavailable?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  hintTone = "muted",
  accent = false,
  loading = false,
  error = false,
  unavailable,
}: StatCardProps) {
  const HintIcon = hintTone === "up" ? TrendingUp : hintTone === "down" ? TrendingDown : null;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            accent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <Spinner className="text-primary" />
        ) : unavailable ? (
          <p className="text-2xl font-bold tracking-tight text-muted-foreground/60">—</p>
        ) : error ? (
          <p className="text-2xl font-bold tracking-tight text-muted-foreground/60">—</p>
        ) : (
          <p
            className={cn(
              "text-3xl font-bold tracking-tight",
              accent ? "text-destructive" : "text-foreground",
            )}
          >
            {value}
          </p>
        )}
      </div>

      <div className="mt-2 min-h-5 text-xs">
        {unavailable ? (
          <span className="text-muted-foreground/70">{unavailable}</span>
        ) : error ? (
          <span className="text-muted-foreground/70">Data unavailable</span>
        ) : hint ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              hintTone === "up" && "text-emerald-600",
              hintTone === "down" && "text-destructive",
              hintTone === "muted" && "text-muted-foreground",
            )}
          >
            {HintIcon && <HintIcon className="size-3.5" />}
            {hint}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
