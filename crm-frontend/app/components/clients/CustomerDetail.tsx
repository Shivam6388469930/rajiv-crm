// components/admin/customers/CustomerDetail.tsx
"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import InvoiceModal from "./InvoiceModal";
import PaymentModal from "./PaymentModal";
import { Customer, Invoice, getCustomer } from "@/app/services/customer.service";

interface CustomerDetailProps {
  customer: Customer | null;
  onBack: () => void;
  onEdit: () => void;
  /** Called with the freshest copy of the customer after an invoice/payment changes their data */
  onCustomerUpdate?: (customer: Customer) => void;
}

type TabType = "ongoing" | "previous" | "completed";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Blocked: "bg-red-100 text-red-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  blocked: "bg-red-100 text-red-800",
};

export default function CustomerDetail({
  customer,
  onBack,
  onEdit,
  onCustomerUpdate,
}: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case "ongoing":
        return customer.invoices.filter(
          (inv) => inv.status === "unpaid" || inv.status === "partial"
        );
      case "previous":
        return customer.invoices.filter((inv) => inv.status === "paid");
      case "completed":
        return customer.invoices.filter((inv) => inv.status === "completed");
      default:
        return customer.invoices;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { color: "bg-green-50 text-green-700", icon: CheckCircleIcon, label: "Paid" },
      partial: { color: "bg-yellow-50 text-yellow-700", icon: ClockIcon, label: "Partial" },
      unpaid: { color: "bg-red-50 text-red-700", icon: XCircleIcon, label: "Unpaid" },
      completed: { color: "bg-blue-50 text-blue-700", icon: CheckCircleIcon, label: "Completed" },
    };
    const info = statusMap[status as keyof typeof statusMap] || statusMap.unpaid;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
        <info.icon className="h-3 w-3" />
        {info.label}
      </span>
    );
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  // Invoices/payments live on the customer record, so after either modal
  // reports success we re-fetch the customer to pick up the recalculated
  // invoices, outstanding balance, and totals.
  const refreshCustomer = async () => {
    setIsRefreshing(true);
    const res = await getCustomer(customer.id);
    setIsRefreshing(false);

    if (res.success && res.data) {
      onCustomerUpdate?.(res.data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
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
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status]}`}>
                  {customer.status}
                </span>
                {isRefreshing && (
                  <span className="text-xs text-gray-400">Refreshing...</span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{customer.company}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  {customer.address}
                </div>
              </div>
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
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-semibold text-gray-900">{customer.total_orders ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-xl font-semibold text-gray-900">${(customer.total_spent ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Outstanding Balance</p>
            <p className={`text-xl font-semibold ${(customer.outstanding ?? 0) > 0 ? "text-red-600" : "text-green-600"}`}>
              ${(customer.outstanding ?? 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer Since</p>
            <p className="text-xl font-semibold text-gray-900">
              {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6">
            <div className="flex gap-1">
              {["ongoing", "previous", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`px-4 py-3 text-sm font-medium transition relative ${
                    activeTab === tab
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
            >
              <PlusIcon className="h-4 w-4" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="divide-y divide-gray-100">
          {getFilteredInvoices().length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No invoices in this category</p>
            </div>
          ) : (
            getFilteredInvoices().map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{invoice.id}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-600">
                        Items: {invoice.items?.length ?? 0}
                      </span>
                      <span className="text-gray-600">
                        Total: ${(invoice.amount ?? 0).toFixed(2)}
                      </span>
                      <span className="text-gray-600">
                        Paid: ${(invoice.paid ?? 0).toFixed(2)}
                      </span>
                      {(invoice.due ?? 0) > 0 && (
                        <span className="text-red-600 font-medium">
                          Due: ${(invoice.due ?? 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {invoice.due > 0 && (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                      >
                        <CurrencyDollarIcon className="h-3.5 w-3.5" />
                        Pay
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition">
                     <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition">
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          customer={customer}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            setSelectedInvoice(null);
            refreshCustomer();
          }}
        />
      )}

      {/* Create Invoice Modal */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          customer={customer}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            refreshCustomer();
          }}
        />
      )}
    </div>
  );
}