export interface AppliedFilters {
  /** Backend invoice `status` code. Empty string means "all". */
  status: string;
  /** Department == doctor specialty name, matched client-side (no server param). Empty means "all". */
  department: string;
  /** ISO date (YYYY-MM-DD). Matches invoices issued on/after this date. */
  dateFrom: string;
  /** ISO date (YYYY-MM-DD). Matches invoices issued on/before this date. */
  dateTo: string;
}

export const EMPTY_FILTERS: AppliedFilters = {
  status: "",
  department: "",
  dateFrom: "",
  dateTo: "",
};

/** Backend `status` codes (billing.Invoice.Status): draft, pending, paid, cancelled, refunded. */
export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Invoices" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];
