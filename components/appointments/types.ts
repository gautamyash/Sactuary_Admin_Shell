export interface AppliedFilters {
  /** Department == doctor specialty name. Empty string means "all". */
  department: string;
  /** Backend appointment status code. Empty string means "all". */
  status: string;
  /** Assigned doctor id as string. Empty string means "all". */
  doctorId: string;
}

export const EMPTY_FILTERS: AppliedFilters = { department: "", status: "", doctorId: "" };

/** Backend `status` codes (appointments.Status): confirmed, pending, completed, cancelled. */
export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
