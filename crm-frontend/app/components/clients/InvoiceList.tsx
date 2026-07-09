// components/admin/invoices/InvoiceList.tsx
"use client";

import { useState } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  DownloadIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface InvoiceListProps {
  onInvoiceSelect: (invoice: any) => void;
  onEdit: (invoice: any) => void;
}

// Mock invoice data
const mockInvoices = [
  {
    id: "1",
    invoice_number: "INV-2024-001",
    customer: {
      id: "1",
      name: "Dr. Sarah Johnson",
      company: "Johnson Eye Clinic",
    },
    date: "2024-01-20",
    due_date: "2024-02-19",
    items: [
      { name: "Eyeglasses - Aviator Gold", quantity: 2, price: 225.00, total: 450.00 },
      { name: "Cleaning Kit", quantity: 3, price: 15.00, total: 45.00 },
    ],
    subtotal: 495.00,
    discount: 45.00,
    tax: 27.00,
    shipping: 0,
    total: 477.00,
    paid: 477.00,
    due: 0,
    status: "paid",
  },
  {
    id: "2",
    invoice_number: "INV-2024-002",
    customer: {
      id: "1",
      name: "Dr. Sarah Johnson",
      company: "Johnson Eye Clinic",
    },
    date: "2024-02-15",
    due_date: "2024-03-16",
    items: [
      { name: "Contact Lenses - Daily", quantity: 4, price: 80.00, total: 320.00 },
    ],
    subtotal: 320.00,
    discount: 0,
    tax: 19.20,
    shipping: 10.00,
    total: 349.20,
    paid: 200.00,
    due: 149.20,
    status: "partial",
  },
  {
    id: "3",
    invoice_number: "INV-2024-003",
    customer: {
      id: "2",
      name: "Michael Chen",
      company: "Vision Care Center",
    },
    date: "2024-03-10",
    due_date: "2024-04-09",
    items: [
      { name: "Progressive Lenses", quantity: 2, price: 390.00, total: 780.00 },
      { name: "Anti-Reflective Coating", quantity: 2, price: 50.00, total: 100.00 },
    ],
    subtotal: 880.00,
    discount: 88.00,
    tax: 47.52,
    shipping: 0,
    total: 839.52,
    paid: 0,
    due: 839.52,
    status: "unpaid",
  },
  {
    id: "4",
    invoice_number: "INV-2024-004",
    customer: {
      id: "3",
      name: "Emily Davis",
      company: "Optix Store",
    },
    date: "2024-03-01",
    due_date: "2024-03-31",
    items: [
      { name: "Frame Repair Kit", quantity: 3, price: 150.00, total: 450.00 },
    ],
    subtotal: 450.00,
    discount: 0,
    tax: 27.00,
    shipping: 0,
    total: 477.00,
    paid: 477.00,
    due: 0,
    status: "completed",
  },
];

const statusConfig = {
  paid: { color: "bg-green-50 text-green-700", icon: CheckCircleIcon, label: "Paid" },
  partial: { color: "bg-yellow-50 text-yellow-700", icon: ClockIcon, label: "Partial" },
  unpaid: { color: "bg-red-50 text-red-700", icon: XCircleIcon, label: "Unpaid" },
  completed: { color: "bg-blue-50 text-blue-700", icon: CheckCircleIcon, label: "Completed" },
  draft: { color: "bg-gray-50 text-gray-700", icon: ClockIcon, label: "Draft" },
};

export default function InvoiceList({ onInvoiceSelect, onEdit }: InvoiceListProps) {
  const [invoices] = useState(mockInvoices);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      console.log("Delete invoice:", id);
    }
  };

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
              const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
              return (
                <tr
                  key={invoice.id}
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
                        {invoice.customer.name}
                      </p>
                      <p className="text-xs text-gray-500">{invoice.customer.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Paid: ${invoice.paid.toFixed(2)}
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
                        invoice.due > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ${invoice.due.toFixed(2)}
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
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(invoice);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Print invoice:", invoice.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(invoice.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
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