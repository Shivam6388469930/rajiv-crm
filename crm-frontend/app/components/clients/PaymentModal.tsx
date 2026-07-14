// components/admin/customers/PaymentModal.tsx
"use client";

import { useState } from "react";
import { XMarkIcon, CreditCardIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { recordPayment, type Invoice } from "@/app/services/invoice.service";

interface PaymentModalProps {
  invoice: any; // accepts both full Invoice and lightweight customer.service Invoice
  customer?: any; // optional – kept for backward compat with CustomerDetail
  onClose: () => void;
  onSuccess: (updatedInvoice: any) => void;
}

export default function PaymentModal({
  invoice,
  customer,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState({
    amount: invoice.due,
    payment_method: "cash",
    reference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!paymentData.amount || paymentData.amount <= 0) {
      setError("Payment amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    const invoiceId = invoice._id || invoice.id;
    const res = await recordPayment(invoiceId, {
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference: paymentData.reference,
      notes: paymentData.notes,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      onSuccess(res.data);
    } else {
      setError(res.message || "Failed to record payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
            <p className="text-sm text-gray-500">
              Invoice: {invoice.invoice_number} · Customer:{" "}
              {invoice.customer?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold text-gray-900">
              ${invoice.total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Already Paid</span>
            <span className="font-semibold text-gray-900">
              ${invoice.paid.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1 pt-1 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Due Amount</span>
            <span className="font-bold text-red-600">
              ${invoice.due.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    amount: parseFloat(e.target.value),
                  })
                }
                step="0.01"
                max={invoice.due}
                min={0.01}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.payment_method}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  payment_method: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) =>
                setPaymentData({ ...paymentData, reference: e.target.value })
              }
              placeholder="Transaction ID or Cheque number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) =>
                setPaymentData({ ...paymentData, notes: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCardIcon className="h-4 w-4" />
              )}
              {submitting ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}