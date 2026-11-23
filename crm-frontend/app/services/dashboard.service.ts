// app/services/dashboard.service.ts

export interface DashboardStats {
  overview: {
    totalSales: number;
    totalPaid: number;
    totalDue: number;
    totalInvoices: number;
    totalCustomers: number;
    totalSuppliers: number;
    activeSuppliers: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  monthlySales: {
    key: string;
    label: string;
    sales: number;
    paid: number;
    invoices: number;
  }[];
  invoiceStatusCounts: Record<string, number>;
  customerTypeCounts: Record<string, number>;
  topCustomers: {
    _id: string;
    name: string;
    company?: string;
    email?: string;
    total_spent: number;
    total_orders: number;
  }[];
  topSuppliers: {
    _id: string;
    name: string;
    product?: string;
    phone?: string;
    status: string;
  }[];
  categoryDistribution: {
    name: string;
    count: number;
  }[];
  recentInvoices: {
    _id: string;
    invoice_number: string;
    customerName: string;
    customerCompany?: string;
    date: string;
    total: number;
    paid: number;
    due: number;
    status: string;
  }[];
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  message?: string;
  data?: DashboardStats;
}> {
  try {
    const res = await fetch("/api/dashboard/stats");
    const json = await res.json();
    return json;
  } catch {
    return {
      success: false,
      message: "Failed to load dashboard statistics",
    };
  }
}

