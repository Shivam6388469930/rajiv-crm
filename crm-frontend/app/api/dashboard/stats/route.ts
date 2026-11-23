// app/api/dashboard/stats/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { success, error } from "@/utils/sendResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch collections in parallel
    const [invoices, customers, suppliers, products, categories] = await Promise.all([
      Invoice.find().populate("customer", "name email company").sort({ createdAt: -1 }).lean(),
      Customer.find().lean(),
      Supplier.find().lean(),
      Product.find().populate("category", "name slug").lean(),
      Category.find().lean(),
    ]);

    // ─── Financial & Sales Stats ─────────────────────────────────────────────
    let totalSales = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const invoiceStatusCounts: Record<string, number> = {
      paid: 0,
      partial: 0,
      unpaid: 0,
      draft: 0,
      cancelled: 0,
    };

    invoices.forEach((inv: any) => {
      totalSales += Number(inv.total) || 0;
      totalPaid += Number(inv.paid) || 0;
      totalDue += Number(inv.due) || 0;
      const st = (inv.status || "unpaid").toLowerCase();
      if (invoiceStatusCounts[st] !== undefined) {
        invoiceStatusCounts[st]++;
      } else {
        invoiceStatusCounts[st] = 1;
      }
    });

    // ─── Monthly Sales (Past 6 Months) ─────────────────────────────────────────
    const now = new Date();
    const monthsData: {
      key: string;
      label: string;
      sales: number;
      paid: number;
      invoices: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleString("default", { month: "short" });
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      monthsData.push({
        key,
        label,
        sales: 0,
        paid: 0,
        invoices: 0,
      });
    }

    invoices.forEach((inv: any) => {
      if (!inv.date) return;
      const invDate = new Date(inv.date);
      const key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthsData.find((m) => m.key === key);
      if (entry) {
        entry.sales += Number(inv.total) || 0;
        entry.paid += Number(inv.paid) || 0;
        entry.invoices++;
      }
    });

    // ─── Customer Stats ───────────────────────────────────────────────────────
    const customerTypeCounts: Record<string, number> = {};
    customers.forEach((c: any) => {
      const type = c.type || "Other";
      customerTypeCounts[type] = (customerTypeCounts[type] || 0) + 1;
    });

    const topCustomers = [...customers]
      .sort((a: any, b: any) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5)
      .map((c: any) => ({
        _id: c._id,
        name: c.name,
        company: c.company,
        email: c.email,
        total_spent: c.total_spent || 0,
        total_orders: c.total_orders || 0,
      }));

    // ─── Supplier Stats ───────────────────────────────────────────────────────
    const activeSuppliers = suppliers.filter((s: any) => s.status === "active").length;
    const topSuppliers = suppliers.slice(0, 5).map((s: any) => ({
      _id: s._id,
      name: s.supplierName,
      product: s.supplyProduct,
      phone: s.phone,
      status: s.status,
    }));

    // ─── Inventory & Product Stats ───────────────────────────────────────────
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryCountMap: Record<string, number> = {};

    products.forEach((p: any) => {
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.minimum_stock) || 0;
      if (stock === 0) outOfStockCount++;
      else if (stock <= minStock) lowStockCount++;

      const catName =
        typeof p.category === "object" && p.category?.name
          ? p.category.name
          : "Uncategorized";
      categoryCountMap[catName] = (categoryCountMap[catName] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCountMap).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // ─── Recent Invoices ─────────────────────────────────────────────────────
    const recentInvoices = invoices.slice(0, 6).map((inv: any) => ({
      _id: inv._id,
      invoice_number: inv.invoice_number,
      customerName: inv.customer?.name || "Unknown Customer",
      customerCompany: inv.customer?.company || "",
      date: inv.date,
      total: inv.total || 0,
      paid: inv.paid || 0,
      due: inv.due || 0,
      status: inv.status || "unpaid",
    }));

    return success("Dashboard statistics fetched successfully", {
      overview: {
        totalSales,
        totalPaid,
        totalDue,
        totalInvoices: invoices.length,
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        activeSuppliers,
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
      },
      monthlySales: monthsData,
      invoiceStatusCounts,
      customerTypeCounts,
      topCustomers,
      topSuppliers,
      categoryDistribution,
      recentInvoices,
    });
  } catch (err: any) {
    return error(err.message);
  }
}

