// app/client/invoice/page.tsx
"use client";

import { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import InvoiceForm from "@/app/components/clients/InvoiceForm";
import InvoiceList from "@/app/components/clients/InvoiceList";
import InvoiceDetail from "@/app/components/clients/InvoiceDetail";
import { type Invoice } from "@/app/services/invoice.service";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshList = () => setListRefreshKey((k) => k + 1);

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedInvoice(null);
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (invoice: Invoice) => {
    refreshList();
    // If we just updated the invoice currently being viewed, sync it
    if (selectedInvoice && selectedInvoice._id === invoice._id) {
      setSelectedInvoice(invoice);
    }
  };

  const handleInvoiceUpdate = (updated: Invoice) => {
    setSelectedInvoice(updated);
    refreshList();
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
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices by number, customer, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <FunnelIcon className="h-4 w-4" />
                Filter
              </button>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  refreshList();
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <InvoiceList
            onInvoiceSelect={handleInvoiceSelect}
            onEdit={handleEdit}
            refreshKey={listRefreshKey}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
          />
        </>
      ) : (
        <InvoiceDetail
          invoice={selectedInvoice}
          onBack={handleBackToList}
          onEdit={() => {
            if (selectedInvoice) handleEdit(selectedInvoice);
          }}
          onInvoiceUpdate={handleInvoiceUpdate}
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
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}