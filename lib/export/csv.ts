/**
 * Minimal client-side CSV export helper (Phase: Export Report & New
 * Appointment actions). No backend export endpoint exists for the Dashboard's
 * aggregate report — its numbers already come from three existing analytics
 * endpoints (billing, attendance, queue) plus the admin appointments list,
 * fetched via the Dashboard's own React Query hooks. Building a *new* backend
 * endpoint to re-derive the same numbers would either duplicate those views'
 * aggregation queries or require refactoring them into a shared service
 * layer — out of scope for an additive change. Rendering the data already on
 * screen as a CSV in the browser reuses that same data with no duplicated
 * business logic and no new backend surface.
 */
export type CsvRow = (string | number | null | undefined)[];

function escapeCsvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  const content = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
