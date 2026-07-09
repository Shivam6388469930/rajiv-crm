// app/admin/invoices/page.tsx
"use client";

import { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import InvoiceForm from "@/app/components/clients/InvoiceForm";
import InvoiceList from "@/app/components/clients/InvoiceList";
import InvoiceDetail from "@/app/components/clients/InvoiceDetail";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const handleInvoiceSelect = (invoice: any) => {
    setSelectedInvoice(invoice);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedInvoice(null);
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage invoices for your customers
          </p>
        </div>
        {viewMode === "list" && (
          <button
            onClick={() => {
              setEditingInvoice(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices by number, customer, or product..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <FunnelIcon className="h-4 w-4" />
                Filter
              </button>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm">
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <InvoiceList
            onInvoiceSelect={handleInvoiceSelect}
            onEdit={handleEdit}
          />
        </>
      ) : (
        <InvoiceDetail
          invoice={selectedInvoice}
          onBack={handleBackToList}
          onEdit={() => {
            setEditingInvoice(selectedInvoice);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Invoice Form Modal */}
      {isFormOpen && (
        <InvoiceForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingInvoice(null);
          }}
          invoice={editingInvoice}
        />
      )}
    </div>
  );
}