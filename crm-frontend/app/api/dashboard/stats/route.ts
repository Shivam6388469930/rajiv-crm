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

    // ─── Past 6 Months Reference Skeleton ────────────────────────────────────
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

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // ─── Parallel High-Performance Aggregations & Projections ────────────────
    const [
      invoiceAggregateResult,
      monthlyAggregateResult,
      recentInvoices,
      totalCustomers,
      customerTypeAgg,
      topCustomers,
      totalSuppliers,
      activeSuppliers,
      topSuppliers,
      totalProducts,
      outOfStockCount,
      lowStockCount,
      categoryDistributionRaw,
    ] = await Promise.all([
      // 1. Overall Financial & Status Totals in a single pipeline
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $ifNull: ["$total", 0] } },
            totalPaid: { $sum: { $ifNull: ["$paid", 0] } },
            totalDue: { $sum: { $ifNull: ["$due", 0] } },
            totalInvoices: { $sum: 1 },
            paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
            partialCount: { $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] } },
            unpaidCount: { $sum: { $cond: [{ $eq: ["$status", "unpaid"] }, 1, 0] } },
            draftCount: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            cancelledCount: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          },
        },
      ]),

      // 2. Monthly Sales Aggregation
      Invoice.aggregate([
        {
          $match: {
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            sales: { $sum: { $ifNull: ["$total", 0] } },
            paid: { $sum: { $ifNull: ["$paid", 0] } },
            invoices: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 3. Recent 6 Invoices (only required fields with projection)
      Invoice.find()
        .select("_id invoice_number customer date total paid due status")
        .populate("customer", "name company")
        .sort({ date: -1, createdAt: -1 })
        .limit(6)
        .lean(),

      // 4. Customer count
      Customer.countDocuments(),

      // 5. Customer Type Distribution
      Customer.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$type", "Other"] },
            count: { $sum: 1 },
          },
        },
      ]),

      // 6. Top 5 Customers by spent
      Customer.find()
        .select("_id name company email total_spent total_orders")
        .sort({ total_spent: -1 })
        .limit(5)
        .lean(),

      // 7. Total Suppliers
      Supplier.countDocuments(),

      // 8. Active Suppliers
      Supplier.countDocuments({ status: "active" }),

      // 9. Top 5 Suppliers
      Supplier.find()
        .select("_id supplierName supplyProduct phone status")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // 10. Total Products
      Product.countDocuments(),

      // 11. Out of stock products
      Product.countDocuments({ stock: { $lte: 0 } }),

      // 12. Low stock products (stock > 0 and stock <= minimum_stock)
      Product.countDocuments({
        $expr: {
          $and: [
            { $gt: ["$stock", 0] },
            { $lte: ["$stock", { $ifNull: ["$minimum_stock", 0] }] },
          ],
        },
      }),

      // 13. Category Distribution Aggregation
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDoc",
          },
        },
        {
          $unwind: {
            path: "$categoryDoc",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: { $ifNull: ["$categoryDoc.name", "Uncategorized"] },
            count: 1,
          },
        },
      ]),
    ]);

    // ─── Format Invoices & Financials ────────────────────────────────────────
    const invStats = invoiceAggregateResult[0] || {
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      totalInvoices: 0,
      paidCount: 0,
      partialCount: 0,
      unpaidCount: 0,
      draftCount: 0,
      cancelledCount: 0,
    };

    const invoiceStatusCounts: Record<string, number> = {
      paid: invStats.paidCount || 0,
      partial: invStats.partialCount || 0,
      unpaid: invStats.unpaidCount || 0,
      draft: invStats.draftCount || 0,
      cancelled: invStats.cancelledCount || 0,
    };

    // ─── Merge Monthly Aggregates ────────────────────────────────────────────
    monthlyAggregateResult.forEach((item: any) => {
      const match = monthsData.find((m) => m.key === item._id);
      if (match) {
        match.sales = item.sales || 0;
        match.paid = item.paid || 0;
        match.invoices = item.invoices || 0;
      }
    });

    // ─── Format Customer Types ───────────────────────────────────────────────
    const customerTypeCounts: Record<string, number> = {};
    customerTypeAgg.forEach((item: any) => {
      const type = item._id || "Other";
      customerTypeCounts[type] = item.count;
    });

    // ─── Format Top Customers ────────────────────────────────────────────────
    const formattedTopCustomers = topCustomers.map((c: any) => ({
      _id: c._id,
      name: c.name,
      company: c.company || "",
      email: c.email || "",
      total_spent: c.total_spent || 0,
      total_orders: c.total_orders || 0,
    }));

    // ─── Format Top Suppliers ────────────────────────────────────────────────
    const formattedTopSuppliers = topSuppliers.map((s: any) => ({
      _id: s._id,
      name: s.supplierName,
      product: s.supplyProduct || "Eyewear",
      phone: s.phone || "",
      status: s.status || "active",
    }));

    // ─── Format Category Distribution ────────────────────────────────────────
    const categoryDistribution = categoryDistributionRaw.map((c: any) => ({
      name: c.name || "Uncategorized",
      count: c.count || 0,
    }));

    // ─── Format Recent Invoices ──────────────────────────────────────────────
    const formattedRecentInvoices = recentInvoices.map((inv: any) => ({
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
        totalSales: invStats.totalSales,
        totalPaid: invStats.totalPaid,
        totalDue: invStats.totalDue,
        totalInvoices: invStats.totalInvoices,
        totalCustomers,
        totalSuppliers,
        activeSuppliers,
        totalProducts,
        lowStockCount,
        outOfStockCount,
      },
      monthlySales: monthsData,
      invoiceStatusCounts,
      customerTypeCounts,
      topCustomers: formattedTopCustomers,
      topSuppliers: formattedTopSuppliers,
      categoryDistribution,
      recentInvoices: formattedRecentInvoices,
    });
  } catch (err: any) {
    return error(err.message);
  }
}
