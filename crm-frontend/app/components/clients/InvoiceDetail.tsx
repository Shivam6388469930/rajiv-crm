// components/admin/invoices/InvoiceDetail.tsx
"use client";

import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface InvoiceDetailProps {
  invoice: any;
  onBack: () => void;
  onEdit: () => void;
}

const statusConfig = {
  paid: { color: "bg-green-50 text-green-700", icon: CheckCircleIcon, label: "Paid" },
  partial: { color: "bg-yellow-50 text-yellow-700", icon: ClockIcon, label: "Partial" },
  unpaid: { color: "bg-red-50 text-red-700", icon: XCircleIcon, label: "Unpaid" },
  completed: { color: "bg-blue-50 text-blue-700", icon: CheckCircleIcon, label: "Completed" },
};

export default function InvoiceDetail({ invoice, onBack, onEdit }: InvoiceDetailProps) {
  if (!invoice) return null;

  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition mt-1"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {invoice.invoice_number}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                >
                  <status.icon className="h-4 w-4" />
                  {status.label}
                </span>
              </div>
              <p className="text-gray-500 mt-1">
                Customer: {invoice.customer.name} · {invoice.customer.company}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              <PrinterIcon className="h-4 w-4" />
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
             <ArrowDownTrayIcon className="h-4 w-4" />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm">
              <PaperAirplaneIcon className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Invoice Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(invoice.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-sm font-bold text-gray-900">${invoice.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className={`text-sm font-bold ${invoice.due > 0 ? "text-red-600" : "text-green-600"}`}>
              ${invoice.due.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Invoice Items</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item: any, index: number) => (
              <tr key={index}>
                <td className="px-6 py-3">
                  <p className="text-sm text-gray-900">{item.name}</p>
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-700">{item.quantity}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-700">${item.price.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50/50">
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Subtotal</td>
              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                ${invoice.subtotal.toFixed(2)}
              </td>
            </tr>
            {invoice.discount > 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Discount</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-green-600">
                  -${invoice.discount.toFixed(2)}
                </td>
              </tr>
            )}
            {invoice.tax > 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Tax</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${invoice.tax.toFixed(2)}
                </td>
              </tr>
            )}
            {invoice.shipping > 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Shipping</td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${invoice.shipping.toFixed(2)}
                </td>
              </tr>
            )}
            <tr className="border-t border-gray-200">
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total</td>
              <td className="px-6 py-4 text-right text-lg font-bold text-indigo-600">
                ${invoice.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Section */}
      {invoice.due > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-500 mt-1">
                Amount due: ${invoice.due.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => console.log("Process payment:", invoice.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
              <p className="text-sm text-gray-600 mt-1">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Terms</h3>
              <p className="text-sm text-gray-600 mt-1">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}