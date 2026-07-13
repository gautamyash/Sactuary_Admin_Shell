"use client";

import { Search } from "lucide-react";

import { useSpecialtyOptions } from "@/components/doctors/queries";
import { STATUS_OPTIONS, type AppliedFilters } from "@/components/doctors/types";
import { Card } from "@/components/ui/card";

export function DoctorsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: {
  filters: AppliedFilters;
  onFiltersChange: (f: AppliedFilters) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const specialties = useSpecialtyOptions();

  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Filters:
      </span>

      <select
        value={filters.specialty}
        onChange={(e) => onFiltersChange({ ...filters, specialty: e.target.value })}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
      >
        <option value="">All Departments</option>
        {specialties.data?.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({ ...filters, status: e.target.value as AppliedFilters["status"] })
        }
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="relative ml-auto min-w-56 flex-1 sm:flex-none">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search medical staff, departments…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-ring"
        />
      </div>
    </Card>
  );
}
