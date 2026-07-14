// app/services/invoice.service.ts
export interface InvoiceItem {
  product_id?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Payment {
  _id?: string;
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer" | "cheque" | "online";
  reference: string;
  notes: string;
  paid_at?: string;
}

export interface Invoice {
  _id: string;
  invoice_number: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    address?: string;
  };
  date: string;
  due_date: string;
  items: InvoiceItem[];
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount: number;
  tax_type: "percentage" | "fixed";
  tax_value: number;
  tax: number;
  shipping: number;
  subtotal: number;
  total: number;
  paid: number;
  due: number;
  payments: Payment[];
  status: "draft" | "unpaid" | "partial" | "paid" | "completed" | "cancelled";
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  invoice_number?: string;
  customer: string; // ObjectId
  date: string;
  due_date: string;
  items: InvoiceItem[];
  discount_type: "percentage" | "fixed";
  discount_value: number;
  tax_type: "percentage" | "fixed";
  tax_value: number;
  shipping: number;
  notes: string;
  terms: string;
  status?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/invoices";

// ─── Invoice CRUD ─────────────────────────────────────────────────────────────

export async function getInvoices(
  filters?: Partial<{ status: string; customer: string; search: string }>
): Promise<ApiResponse<Invoice[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.customer) params.set("customer", filters.customer);
    if (filters?.search) params.set("search", filters.search);

    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
    const res = await fetch(url);
    const data = await res.json();
    return { success: data.success, message: data.message, data: data.data };
  } catch {
    return { success: false, message: "Failed to fetch invoices" };
  }
}

export async function getInvoice(id: string): Promise<ApiResponse<Invoice>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return { success: data.success, message: data.message, data: data.data };
  } catch {
    return { success: false, message: "Failed to fetch invoice" };
  }
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<ApiResponse<Invoice>> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return { success: data.success, message: data.message, data: data.data };
  } catch {
    return { success: false, message: "Failed to create invoice" };
  }
}

export async function updateInvoice(
  id: string,
  input: Partial<CreateInvoiceInput>
): Promise<ApiResponse<Invoice>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return { success: data.success, message: data.message, data: data.data };
  } catch {
    return { success: false, message: "Failed to update invoice" };
  }
}

export async function deleteInvoice(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const data = await res.json();
    return { success: data.success, message: data.message };
  } catch {
    return { success: false, message: "Failed to delete invoice" };
  }
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export async function recordPayment(
  invoiceId: string,
  payment: {
    amount: number;
    payment_method: string;
    reference?: string;
    notes?: string;
  }
): Promise<ApiResponse<Invoice>> {
  try {
    const res = await fetch(`${API_BASE}/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    const data = await res.json();
    return { success: data.success, message: data.message, data: data.data };
  } catch {
    return { success: false, message: "Failed to record payment" };
  }
}

// ─── Invoice Number ───────────────────────────────────────────────────────────

export async function fetchNextInvoiceNumber(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/generate-number`);
    const data = await res.json();
    if (data.success) return data.data.invoice_number;
    throw new Error(data.message);
  } catch {
    // Fallback: generate locally
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const r = Math.floor(Math.random() * 900 + 100);
    return `INV-${y}${m}-${r}`;
  }
}
