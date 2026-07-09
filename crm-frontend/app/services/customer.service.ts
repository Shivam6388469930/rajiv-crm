// services/customer.service.ts

const BASE_URL = "/api/customers";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  paid: number;
  due: number;
  status: "paid" | "partial" | "unpaid" | "completed";
  items: InvoiceItem[];
}

export type CustomerStatus = "active" | "inactive" | "blocked" | "pending";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  type: string;
  status: CustomerStatus;
  created_at: string;
  total_orders: number;
  total_spent: number;
  outstanding: number;
  invoices: Invoice[];
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  type: string;
  status: CustomerStatus;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      return {
        success: false,
        message: "Unexpected server response. Please try again.",
      };
    }

    if (!res.ok && json.success === undefined) {
      return {
        success: false,
        message: json.message || "Something went wrong. Please try again.",
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

// Fills in safe defaults for fields the API might omit (e.g. a brand-new
// customer with no orders yet may not have total_spent/outstanding set).
function normalizeCustomer(raw: any): Customer {
  return {
    id: raw?.id ?? raw?._id ?? "",
    name: raw?.name ?? "",
    email: raw?.email ?? "",
    phone: raw?.phone ?? "",
    address: raw?.address ?? "",
    company: raw?.company ?? "",
    type: raw?.type ?? "",
    status: raw?.status ?? "active",
    created_at: raw?.created_at ?? new Date().toISOString(),
    total_orders: Number(raw?.total_orders) || 0,
    total_spent: Number(raw?.total_spent) || 0,
    outstanding: Number(raw?.outstanding) || 0,
    invoices: Array.isArray(raw?.invoices) ? raw.invoices : [],
  };
}

export const getCustomers = async () => {
  const res = await request<any[]>("");
  if (res.success && res.data) {
    return { ...res, data: res.data.map(normalizeCustomer) };
  }
  return res as ApiResponse<Customer[]>;
};

export const getCustomer = async (id: string) => {
  const res = await request<any>(`/${id}`);
  if (res.success && res.data) {
    return { ...res, data: normalizeCustomer(res.data) };
  }
  return res as ApiResponse<Customer>;
};

export const createCustomer = async (data: CustomerInput) => {
  const res = await request<any>("", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    return { ...res, data: normalizeCustomer(res.data) };
  }
  return res as ApiResponse<Customer>;
};

export const updateCustomer = async (
  id: string,
  data: Partial<CustomerInput>
) => {
  const res = await request<any>(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    return { ...res, data: normalizeCustomer(res.data) };
  }
  return res as ApiResponse<Customer>;
};

export const deleteCustomer = (id: string) =>
  request<{ id: string }>(`/${id}`, {
    method: "DELETE",
  });