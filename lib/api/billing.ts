import { apiClient } from "@/lib/api/client";
import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface InvoiceItem {
  id: number;
  service: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface InvoicePayment {
  id: number;
  method: string;
  reference: string;
  amount: number;
  status: string;
  paidAt: string;
  notes: string;
}

export interface InvoiceRefund {
  id: number;
  amount: number;
  reason: string;
  processedAt: string;
}

export interface AdminInvoice {
  id: number;
  invoiceNumber: string;
  appointmentId: number | null;
  patientId: number;
  patientName: string;
  doctorId: number | null;
  doctorName: string | null;
  specialty: string | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  couponCode: string | null;
  issuedAt: string;
  paidAt: string | null;
  notes: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  refunds: InvoiceRefund[];
}

interface RawInvoiceItem {
  id: number;
  service: number | null;
  description: string;
  quantity: number;
  unit_price: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
}

interface RawInvoicePayment {
  id: number;
  method: string;
  reference: string;
  amount: string | number;
  status: string;
  paid_at: string;
  notes: string;
}

interface RawInvoiceRefund {
  id: number;
  amount: string | number;
  reason: string;
  processed_at: string;
}

interface RawInvoice {
  id: number;
  invoice_number: string;
  appointment: number | null;
  patient: number;
  patient_name: string;
  doctor: number | null;
  doctor_detail: { name: string; specialty: string } | null;
  status: string;
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  amount_paid: string | number;
  balance: string | number;
  payment_status: string;
  coupon_code: string | null;
  issued_at: string;
  paid_at: string | null;
  notes: string;
  items: RawInvoiceItem[];
  payments: RawInvoicePayment[];
  refunds: RawInvoiceRefund[];
}

const num = (v: string | number | null | undefined) => (v == null ? 0 : Number(v));

function toInvoice(i: RawInvoice): AdminInvoice {
  return {
    id: i.id,
    invoiceNumber: i.invoice_number,
    appointmentId: i.appointment ?? null,
    patientId: i.patient,
    patientName: i.patient_name ?? "—",
    doctorId: i.doctor ?? null,
    doctorName: i.doctor_detail?.name ?? null,
    specialty: i.doctor_detail?.specialty ?? null,
    status: i.status,
    paymentStatus: i.payment_status,
    subtotal: num(i.subtotal),
    discount: num(i.discount),
    tax: num(i.tax),
    total: num(i.total),
    amountPaid: num(i.amount_paid),
    balance: num(i.balance),
    couponCode: i.coupon_code ?? null,
    issuedAt: i.issued_at,
    paidAt: i.paid_at ?? null,
    notes: i.notes ?? "",
    items: (i.items ?? []).map((it) => ({
      id: it.id,
      service: it.service ?? null,
      description: it.description,
      quantity: it.quantity,
      unitPrice: num(it.unit_price),
      discount: num(it.discount),
      tax: num(it.tax),
      total: num(it.total),
    })),
    payments: (i.payments ?? []).map((p) => ({
      id: p.id,
      method: p.method,
      reference: p.reference,
      amount: num(p.amount),
      status: p.status,
      paidAt: p.paid_at,
      notes: p.notes,
    })),
    refunds: (i.refunds ?? []).map((r) => ({
      id: r.id,
      amount: num(r.amount),
      reason: r.reason,
      processedAt: r.processed_at,
    })),
  };
}

export interface AdminInvoiceParams {
  status?: string;
  paymentStatus?: string;
  patient?: number | string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export const billingApi = {
  async adminList(params?: AdminInvoiceParams): Promise<AdminInvoice[]> {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.paymentStatus) search.set("payment_status", params.paymentStatus);
    if (params?.patient) search.set("patient", String(params.patient));
    if (params?.dateFrom) search.set("date_from", params.dateFrom);
    if (params?.dateTo) search.set("date_to", params.dateTo);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString() ? `?${search.toString()}` : "";
    const data = await http.get<{ results: RawInvoice[] }>(`${endpoints.billing.invoices}${qs}`);
    return (data.results ?? []).map(toInvoice);
  },

  /** Downloads the PDF via the authenticated axios client (a plain <a href> can't carry the bearer token). */
  async downloadInvoicePdf(id: number, invoiceNumber: string): Promise<void> {
    const res = await apiClient.get(endpoints.billing.invoicePdf(id), { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
