// app/admin/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import CustomerList from "@/app/components/clients/CustomerList";
import CustomerForm from "@/app/components/clients/CustomerForm";
import CustomerDetail from "@/app/components/clients/CustomerDetail";
import {
  Customer,
  getCustomers,
  deleteCustomer,
} from "@/app/services/customer.service";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setIsLoading(true);
    setLoadError(null);

    const res = await getCustomers();

    if (res.success && res.data) {
      setCustomers(res.data);
    } else {
      setLoadError(res.message || "Could not load customers.");
    }

    setIsLoading(false);
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCustomer(null);
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  // Called by CustomerForm after a successful create/update
  const handleFormSuccess = (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      return exists
        ? prev.map((c) => (c.id === customer.id ? customer : c))
        : [...prev, customer];
    });

    // Keep the detail view in sync if we just edited the customer being viewed
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(customer);
    }
  };

  // Called by CustomerDetail after an invoice/payment changes the customer
  const handleCustomerUpdate = (customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    setSelectedCustomer(customer);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) return;

    setDeletingId(customer.id);
    const res = await deleteCustomer(customer.id);
    setDeletingId(null);

    if (res.success) {
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      if (selectedCustomer?.id === customer.id) {
        handleBackToList();
      }
    } else {
      alert(res.message || "Could not delete customer.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customers, invoices, and payments
          </p>
        </div>
        {viewMode === "list" && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add Customer
          </button>
        )}
      </div>

      {/* Search & Filters - Show only in list view */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
            <FunnelIcon className="h-4 w-4" />
            Filter
          </button>
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <CustomerList
          customers={customers}
          searchTerm={searchTerm}
          isLoading={isLoading}
          loadError={loadError}
          deletingId={deletingId}
          onRetry={loadCustomers}
          onCustomerSelect={handleCustomerSelect}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ) : (
        <CustomerDetail
          customer={selectedCustomer}
          onBack={handleBackToList}
          onEdit={() => selectedCustomer && handleOpenEdit(selectedCustomer)}
          onCustomerUpdate={handleCustomerUpdate}
        />
      )}

      {/* Customer Form Modal */}
      {isFormOpen && (
        <CustomerForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCustomer(null);
          }}
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}