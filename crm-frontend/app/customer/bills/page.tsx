// app/customer/bills/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PrinterIcon,
  XMarkIcon,
  ArrowPathIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { getInvoices, Invoice } from "@/app/services/invoice.service";
import {
  getAdminWhatsAppNumber,
  generateWhatsAppLink,
  formatBillWhatsAppMessage,
} from "@/lib/whatsapp";

const billStatusBadge: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: "Fully Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircleIcon },
  partial: { label: "Partially Paid", color: "bg-amber-50 text-amber-700 border-amber-200", icon: ClockIcon },
  unpaid: { label: "Unpaid / Due", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircleIcon },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200", icon: ClockIcon },
};

export default function CustomerBillsPage() {
  const [bills, setBills] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBill, setActiveBill] = useState<Invoice | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await getInvoices();
      if (res.success && res.data) {
        setBills(res.data);
      }
    } catch (e) {
      console.error("Failed to load bills", e);
    } finally {
      setLoading(false);
    }
  };

  const totalBilled = bills.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.paid || 0), 0);
  const totalDue = bills.reduce((sum, b) => sum + (b.due || 0), 0);

  const handleWhatsAppBillShare = (bill: Invoice) => {
    const adminPhone = getAdminWhatsAppNumber();
    const text = formatBillWhatsAppMessage({
      invoiceNumber: bill.invoice_number,
      customerName: bill.customer?.name || "Valued Customer",
      total: bill.total || 0,
      paid: bill.paid || 0,
      due: bill.due || 0,
      dueDate: bill.due_date,
    });
    const link = generateWhatsAppLink(adminPhone, text);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bill & Invoice Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View generated optical bills, payment status, receipts & balance statements
          </p>
        </div>

        <button
          onClick={loadBills}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 text-gray-700 transition"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh Bills
        </button>
      </div>

      {/* ─── Financial Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Billed</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            ${totalBilled.toFixed(2)}
          </p>
          <span className="text-2xs text-gray-400 mt-1 block">{bills.length} Total Invoices</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Paid</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            ${totalPaid.toFixed(2)}
          </p>
          <span className="text-2xs text-emerald-600 font-medium mt-1 block">Cleared Payments</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Balance Due</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <BanknotesIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">
            ${totalDue.toFixed(2)}
          </p>
          <span className="text-2xs text-rose-500 font-medium mt-1 block">Pending Settlement</span>
        </div>
      </div>

      {/* ─── Bills Table / List ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
          <ArrowPathIcon className="h-7 w-7 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading bills...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-500 max-w-md mx-auto">
          <DocumentTextIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-800">No Invoices on File</h3>
          <p className="text-xs text-gray-400 mt-1">Invoices are automatically created when you place an order.</p>
          <Link
            href="/customer"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
          >
            Start an Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Invoice #</th>
                  <th className="px-5 py-3 text-left">Customer / Clinic</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Paid</th>
                  <th className="px-5 py-3 text-left">Due</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => {
                  const statusMeta =
                    billStatusBadge[bill.status] || billStatusBadge.unpaid;
                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr key={bill._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        {bill.invoice_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{bill.customer?.name}</p>
                        {bill.customer?.company && (
                          <p className="text-xs text-gray-400">{bill.customer?.company}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        {bill.date ? new Date(bill.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        ${(bill.total || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600">
                        ${(bill.paid || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-rose-600">
                        ${(bill.due || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border ${statusMeta.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppBillShare(bill)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Inquire or Share on WhatsApp"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveBill(bill)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                          >
                            View Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Printable Bill / Invoice Modal ─── */}
      {activeBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-8 relative shadow-2xl space-y-6">
            <button
              onClick={() => setActiveBill(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 print:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Bill Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div>
                <span className="text-xl font-extrabold text-indigo-600">OpticCRM</span>
                <p className="text-xs text-gray-500 mt-0.5">Optical Products & Clinical Supplies</p>
                <p className="text-2xs text-gray-400">GSTIN: 27AABCO1234F1Z5</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-gray-900 block">TAX INVOICE</span>
                <p className="text-xs font-bold text-gray-700 mt-1">
                  #{activeBill.invoice_number}
                </p>
                <p className="text-2xs text-gray-500">
                  Date: {activeBill.date ? new Date(activeBill.date).toLocaleDateString() : ""}
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="font-bold text-gray-800 uppercase text-2xs">Billed To:</p>
                <p className="font-bold text-gray-900">{activeBill.customer?.name}</p>
                <p className="text-gray-500">{activeBill.customer?.company}</p>
                <p className="text-gray-500">{activeBill.customer?.phone || activeBill.customer?.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="font-bold text-gray-800 uppercase text-2xs">Invoice Summary:</p>
                <p className="text-gray-600">
                  Due Date:{" "}
                  <b>{activeBill.due_date ? new Date(activeBill.due_date).toLocaleDateString() : "—"}</b>
                </p>
                <p className="text-gray-600">
                  Status: <b className="capitalize text-indigo-600">{activeBill.status}</b>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 font-bold text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Item Description</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeBill.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{it.name}</td>
                      <td className="px-4 py-2.5 text-center">{it.quantity}</td>
                      <td className="px-4 py-2.5 text-right">${it.price.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                        ${it.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${(activeBill.subtotal || 0).toFixed(2)}</span>
                </div>
                {activeBill.shipping > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>${activeBill.shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">${(activeBill.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>Paid:</span>
                  <span>${(activeBill.paid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>Balance Due:</span>
                  <span>${(activeBill.due || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PrinterIcon className="h-4 w-4" />
                Print Bill
              </button>
              <button
                type="button"
                onClick={() => handleWhatsAppBillShare(activeBill)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                Inquire on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setActiveBill(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
