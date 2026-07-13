export interface AppliedFilters {
  /** Specialty name, matched server-side (?specialty=). Empty means "all". */
  specialty: string;
  /** Client-side only — the backend has no combined status filter param. */
  status: "" | "on_duty" | "on_leave";
}

export const EMPTY_FILTERS: AppliedFilters = { specialty: "", status: "" };

export const STATUS_OPTIONS: { value: AppliedFilters["status"]; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "on_duty", label: "On-duty" },
  { value: "on_leave", label: "On-leave" },
];

/** Matches backend DoctorSchedule.Weekday (IntegerChoices): 0=Monday..6=Sunday. */
export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_OPTIONS.find((w) => w.value === weekday)?.label ?? "—";
}

/** JS getDay() is 0=Sunday..6=Saturday; backend weekday is 0=Monday..6=Sunday. */
export function todayWeekday(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Floor 4, Wing B, Room 12" style summary from whichever location fields
 * are set — real data only, omits parts that are blank. */
export function locationSummary(doctor: { floor: string; wing: string; room: string }): string {
  const parts: string[] = [];
  if (doctor.floor) parts.push(`Floor ${doctor.floor}`);
  if (doctor.wing) parts.push(`Wing ${doctor.wing}`);
  if (doctor.room) parts.push(`Room ${doctor.room}`);
  return parts.join(", ");
}
