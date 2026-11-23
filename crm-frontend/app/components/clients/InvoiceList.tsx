// components/admin/invoices/InvoiceList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  getInvoices,
  deleteInvoice,
  type Invoice,
} from "@/app/services/invoice.service";

interface InvoiceListProps {
  onInvoiceSelect: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  refreshKey?: number; // increment this from parent to trigger a reload
  statusFilter?: string;
  searchQuery?: string;
}

const statusConfig = {
  paid: {
    color: "bg-green-50 text-green-700",
    icon: CheckCircleIcon,
    label: "Paid",
  },
  partial: {
    color: "bg-yellow-50 text-yellow-700",
    icon: ClockIcon,
    label: "Partial",
  },
  unpaid: {
    color: "bg-red-50 text-red-700",
    icon: XCircleIcon,
    label: "Unpaid",
  },
  completed: {
    color: "bg-blue-50 text-blue-700",
    icon: CheckCircleIcon,
    label: "Completed",
  },
  draft: {
    color: "bg-gray-50 text-gray-700",
    icon: ClockIcon,
    label: "Draft",
  },
  cancelled: {
    color: "bg-gray-50 text-gray-500",
    icon: XCircleIcon,
    label: "Cancelled",
  },
};

export default function InvoiceList({
  onInvoiceSelect,
  onEdit,
  refreshKey = 0,
  statusFilter = "",
  searchQuery = "",
}: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getInvoices({
      status: statusFilter || undefined,
      search: searchQuery || undefined,
    });
    if (res.success && res.data) {
      setInvoices(res.data);
    } else {
      setError(res.message || "Failed to load invoices");
    }
    setLoading(false);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshKey]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    setDeletingId(id);
    const res = await deleteInvoice(id);
    if (res.success) {
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } else {
      alert(res.message || "Failed to delete invoice");
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <ArrowPathIcon className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchInvoices}
          className="text-sm text-indigo-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-sm text-gray-500">
          No invoices found. Create your first invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => {
              const statusKey =
                invoice.status as keyof typeof statusConfig;
              const status =
                statusConfig[statusKey] || statusConfig.unpaid;
              return (
                <tr
                  key={invoice._id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onInvoiceSelect(invoice)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        Items: {invoice.items.length}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invoice.customer?.company}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due:{" "}
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${(invoice.total ?? 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Paid: ${(invoice.paid ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                    >
                      <status.icon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        invoice.due > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${(invoice.due ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvoiceSelect(invoice);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(invoice);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.print();
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Print"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, invoice._id)}
                        disabled={deletingId === invoice._id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
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
  );
}