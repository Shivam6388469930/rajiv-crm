// app/client/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BanknotesIcon,
  DocumentTextIcon,
  UsersIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  getDashboardStats,
  DashboardStats,
} from "@/app/services/dashboard.service";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<"sales" | "paid">("sales");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const res = await getDashboardStats();
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.message || "Failed to load dashboard data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading CRM analytics dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto my-12">
        <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Dashboard Unavailable</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">{error || "Could not retrieve statistics."}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, monthlySales, invoiceStatusCounts, customerTypeCounts, topCustomers, topSuppliers, categoryDistribution, recentInvoices } = stats;

  // Monthly Sales Chart calculations
  const maxMonthlyVal = Math.max(
    ...monthlySales.map((m) => Math.max(m.sales, m.paid)),
    100
  );

  // Status donut calculations
  const statusTotal =
    (invoiceStatusCounts.paid || 0) +
    (invoiceStatusCounts.partial || 0) +
    (invoiceStatusCounts.unpaid || 0) +
    (invoiceStatusCounts.draft || 0);

  const paidPct = statusTotal > 0 ? Math.round(((invoiceStatusCounts.paid || 0) / statusTotal) * 100) : 0;
  const partialPct = statusTotal > 0 ? Math.round(((invoiceStatusCounts.partial || 0) / statusTotal) * 100) : 0;
  const unpaidPct = statusTotal > 0 ? Math.round(((invoiceStatusCounts.unpaid || 0) / statusTotal) * 100) : 0;

  // Customer Types count
  const customerTypesList = Object.entries(customerTypeCounts).map(([type, count]) => ({
    type,
    count,
    pct: overview.totalCustomers > 0 ? Math.round((count / overview.totalCustomers) * 100) : 0,
  }));

  const customerColors: Record<string, string> = {
    Clinic: "bg-blue-500",
    "Optical Store": "bg-indigo-500",
    Retail: "bg-emerald-500",
    Wholesale: "bg-amber-500",
    Other: "bg-purple-500",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time graphical performance of sales, customers, suppliers & inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <Link
            href="/client/invoice"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Link>
          <Link
            href="/client/products"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* ─── KPI Metric Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <BanknotesIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ${overview.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Paid: ${overview.totalPaid.toLocaleString()}
            </span>
            <span className="text-red-500 font-medium">
              Due: ${overview.totalDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Invoices
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {overview.totalInvoices}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
              {invoiceStatusCounts.paid || 0} Paid
            </span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">
              {invoiceStatusCounts.partial || 0} Partial
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
              {invoiceStatusCounts.unpaid || 0} Unpaid
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Customers
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {overview.totalCustomers}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Clinics & Stores</span>
            <Link href="/client/customers" className="text-indigo-600 hover:underline font-medium">
              View all
            </Link>
          </div>
        </div>

        {/* Suppliers & Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Suppliers & Stock
            </span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TruckIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {overview.totalSuppliers} <span className="text-sm font-normal text-gray-500">Suppliers</span>
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {overview.totalProducts} Products
            </span>
            {overview.lowStockCount > 0 ? (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                {overview.lowStockCount} Low Stock
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Stock Healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Graphical Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Collection Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
                Monthly Revenue & Collection Trend
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Performance breakdown over the last 6 months
              </p>
            </div>
            {/* Metric Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartMetric("sales")}
                className={`px-3 py-1.5 rounded-md transition ${
                  chartMetric === "sales"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Invoiced Revenue
              </button>
              <button
                onClick={() => setChartMetric("paid")}
                className={`px-3 py-1.5 rounded-md transition ${
                  chartMetric === "paid"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Amount Collected
              </button>
            </div>
          </div>

          {/* SVG Bar & Trend Chart */}
          <div className="relative pt-4 pb-2">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {monthlySales.map((month, idx) => {
                const salesHeight = maxMonthlyVal > 0 ? (month.sales / maxMonthlyVal) * 100 : 0;
                const paidHeight = maxMonthlyVal > 0 ? (month.paid / maxMonthlyVal) * 100 : 0;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={month.key}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-20 bg-gray-900 text-white rounded-lg p-2 text-xs shadow-lg whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2">
                        <p className="font-bold text-indigo-300">{month.label}</p>
                        <p>Revenue: ${month.sales.toLocaleString()}</p>
                        <p className="text-emerald-400">Paid: ${month.paid.toLocaleString()}</p>
                        <p className="text-gray-400">{month.invoices} invoices</p>
                      </div>
                    )}

                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1.5 h-full max-w-[56px]">
                      {/* Revenue Bar */}
                      <div
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          chartMetric === "sales"
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-indigo-200"
                        }`}
                        style={{ height: `${Math.max(salesHeight, 4)}%` }}
                      />
                      {/* Paid Bar */}
                      <div
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          chartMetric === "paid"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-emerald-200"
                        }`}
                        style={{ height: `${Math.max(paidHeight, 4)}%` }}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-xs font-medium text-gray-500 mt-2">
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-indigo-600" />
                <span className="text-gray-600 font-medium">Billed Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-gray-600 font-medium">Cash Collected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status & Payment Distribution (1 Column) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invoice Status Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Breakdown of {overview.totalInvoices} invoices
            </p>

            {/* Circular Donut Display */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-gray-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Paid Segment (Green) */}
                <path
                  className="text-emerald-500 transition-all duration-500"
                  strokeDasharray={`${paidPct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Partial Segment (Yellow) */}
                <path
                  className="text-amber-400 transition-all duration-500"
                  strokeDasharray={`${partialPct}, 100`}
                  strokeDashoffset={`-${paidPct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Unpaid Segment (Red) */}
                <path
                  className="text-rose-500 transition-all duration-500"
                  strokeDasharray={`${unpaidPct}, 100`}
                  strokeDashoffset={`-${paidPct + partialPct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-gray-900">{paidPct}%</span>
                <span className="text-2xs uppercase tracking-wider text-gray-400 font-semibold">
                  Collection Rate
                </span>
              </div>
            </div>

            {/* Status Legend Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-gray-800">Fully Paid</span>
                </div>
                <span className="font-bold text-gray-900">{invoiceStatusCounts.paid || 0} ({paidPct}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="font-medium text-gray-800">Partially Paid</span>
                </div>
                <span className="font-bold text-gray-900">{invoiceStatusCounts.partial || 0} ({partialPct}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium text-gray-800">Unpaid / Overdue</span>
                </div>
                <span className="font-bold text-gray-900">{invoiceStatusCounts.unpaid || 0} ({unpaidPct}%)</span>
              </div>
            </div>
          </div>

          <Link
            href="/client/invoice"
            className="mt-4 block text-center py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Manage all invoices →
          </Link>
        </div>
      </div>

      {/* ─── Second Analytics Row: Customers & Categories ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segmentation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer Types</h2>
              <p className="text-xs text-gray-500">Distribution across business sectors</p>
            </div>
            <Link
              href="/client/customers"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              View directory
            </Link>
          </div>

          {customerTypesList.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No customer records found</p>
          ) : (
            <div className="space-y-4">
              {customerTypesList.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-700">{item.type}</span>
                    <span className="text-gray-900 font-semibold">
                      {item.count} customers ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        customerColors[item.type] || "bg-indigo-500"
                      }`}
                      style={{ width: `${Math.max(item.pct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Spending Customers preview */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Top Customers By Spending
            </h3>
            <div className="space-y-2">
              {topCustomers.map((cust, i) => (
                <div
                  key={cust._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-2xs">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{cust.name}</p>
                      <p className="text-gray-500 text-2xs">{cust.company || cust.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${cust.total_spent.toLocaleString()}</p>
                    <p className="text-gray-400 text-2xs">{cust.total_orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suppliers & Category Inventory Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Suppliers & Catalog</h2>
                <p className="text-xs text-gray-500">Products by category & vendor status</p>
              </div>
              <Link
                href="/client/suppliers"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                All suppliers
              </Link>
            </div>

            {/* Category Bars */}
            <div className="space-y-3 mb-6">
              {categoryDistribution.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No category data yet</p>
              ) : (
                categoryDistribution.map((cat, idx) => {
                  const maxCat = Math.max(...categoryDistribution.map((c) => c.count), 1);
                  const widthPct = Math.round((cat.count / maxCat) * 100);
                  const colors = [
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-teal-500",
                    "bg-orange-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                  ];
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-700">{cat.name}</span>
                        <span className="text-gray-900 font-bold">{cat.count} items</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[idx % colors.length]}`}
                          style={{ width: `${Math.max(widthPct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Active Suppliers Snapshot */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Key Suppliers
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  {overview.activeSuppliers} Active
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {topSuppliers.map((sup) => (
                  <div key={sup._id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-900">{sup.name}</p>
                      <p className="text-gray-500 text-2xs">{sup.product || "Optical Equipment"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">{sup.phone || "—"}</span>
                      <span
                        className={`ml-2 inline-block px-1.5 py-0.5 rounded text-2xs font-medium ${
                          sup.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sup.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/client/products"
            className="mt-4 block text-center py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Manage inventory & products →
          </Link>
        </div>
      </div>

      {/* ─── Recent Invoices Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
            <p className="text-xs text-gray-500">Latest transactions across all accounts</p>
          </div>
          <Link
            href="/client/invoice"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all ({overview.totalInvoices})
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            No invoices created yet.
            <div className="mt-3">
              <Link
                href="/client/invoice"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Create First Invoice
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentInvoices.map((inv) => {
                  const statusStyles: Record<string, string> = {
                    paid: "bg-green-50 text-green-700",
                    partial: "bg-yellow-50 text-yellow-700",
                    unpaid: "bg-red-50 text-red-700",
                    draft: "bg-gray-100 text-gray-600",
                    cancelled: "bg-gray-100 text-gray-500",
                  };
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        {inv.invoice_number}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{inv.customerName}</p>
                        {inv.customerCompany && (
                          <p className="text-xs text-gray-400">{inv.customerCompany}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">
                        {inv.date ? new Date(inv.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        ${inv.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-medium ${
                            inv.due > 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          ${inv.due.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            statusStyles[inv.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href="/client/invoice"
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
