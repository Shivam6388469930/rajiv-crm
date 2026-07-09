// components/admin/customers/CustomerList.tsx
"use client";

import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { Customer } from "@/app/services/customer.service";

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
  isLoading: boolean;
  loadError: string | null;
  deletingId: string | null;
  onRetry: () => void;
  onCustomerSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-50 text-gray-700",
  blocked: "bg-red-50 text-red-700",
  pending: "bg-yellow-50 text-yellow-700",
};

function Spinner({ className = "h-4 w-4 text-white" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function CustomerList({
  customers,
  searchTerm,
  isLoading,
  loadError,
  deletingId,
  onRetry,
  onCustomerSelect,
  onEdit,
  onDelete,
}: CustomerListProps) {
  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      (customer.name ?? "").toLowerCase().includes(term) ||
      (customer.email ?? "").toLowerCase().includes(term) ||
      (customer.phone ?? "").includes(searchTerm)
    );
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
        <Spinner className="h-6 w-6 text-indigo-500" />
        <p className="text-sm">Loading customers...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  if (filteredCustomers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <UserCircleIcon className="h-8 w-8 text-gray-300" />
        <p className="text-sm">
          {searchTerm ? "No customers match your search." : "No customers yet."}
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
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outstanding
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => onCustomerSelect(customer)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500">{customer.company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <PhoneIcon className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{customer.type}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.total_orders ?? 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${(customer.total_spent ?? 0).toFixed(2)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-medium ${
                      (customer.outstanding ?? 0) > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${(customer.outstanding ?? 0).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[customer.status] || statusColors.active
                    }`}
                  >
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCustomerSelect(customer);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(customer);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(customer);
                      }}
                      disabled={deletingId === customer.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === customer.id ? (
                        <Spinner className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}