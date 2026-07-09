// app/admin/box-prints/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  BoxPrint,
  BoxPrintInput,
  getBoxPrints,
  createBoxPrint,
  updateBoxPrint,
  deleteBoxPrint,
} from "@/app/services/boxPrint.service";

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

const emptyForm: BoxPrintInput = {
  printName: "",
  status: "active",
};

export default function BoxPrintsPage() {
  const [boxPrints, setBoxPrints] = useState<BoxPrint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrint, setEditingPrint] = useState<BoxPrint | null>(null);
  const [form, setForm] = useState<BoxPrintInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadBoxPrints();
  }, []);

  async function loadBoxPrints() {
    setIsLoading(true);
    setLoadError(null);

    const res = await getBoxPrints();

    if (res.success && res.data) {
      setBoxPrints(res.data);
    } else {
      setLoadError(res.message || "Could not load box prints.");
    }

    setIsLoading(false);
  }

  const filteredPrints = boxPrints.filter(
    (print) =>
      print.printName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingPrint(null);
    setForm({ ...emptyForm });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (print: BoxPrint) => {
    setEditingPrint(print);
    setForm({
      printName: print.printName,
      status: print.status,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrint(null);
    setForm(emptyForm);
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!form.printName.trim()) {
      setModalError("Print name is required.");
      return;
    }

    const payload: BoxPrintInput = {
      ...form,
      printName: form.printName.trim(),
    };

    setIsSubmitting(true);

    const res = editingPrint
      ? await updateBoxPrint(editingPrint._id, payload)
      : await createBoxPrint(payload);

    setIsSubmitting(false);

    if (res.success && res.data) {
      setBoxPrints((prev) => {
        const exists = prev.some((s) => s._id === res.data!._id);
        return exists
          ? prev.map((s) => (s._id === res.data!._id ? res.data! : s))
          : [...prev, res.data!];
      });
      closeModal();
    } else {
      setModalError(
        res.message ||
          `Could not ${editingPrint ? "update" : "create"} box print. Please try again.`
      );
    }
  };

  const handleDelete = async (print: BoxPrint) => {
    if (!confirm(`Delete "${print.printName}"? This cannot be undone.`)) return;

    setDeletingId(print._id);
    const res = await deleteBoxPrint(print._id);
    setDeletingId(null);

    if (res.success) {
      setBoxPrints((prev) => prev.filter((s) => s._id !== print._id));
    } else {
      alert(res.message || "Could not delete box print.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Box Prints</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage box print options for your optical store
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          New Box Print
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search box prints by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Spinner className="h-6 w-6 text-indigo-500" />
          <p className="text-sm">Loading box prints...</p>
        </div>
      )}

      {/* Load error */}
      {!isLoading && loadError && (
        <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            onClick={loadBoxPrints}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && filteredPrints.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <PrinterIcon className="h-8 w-8 text-gray-300" />
          <p className="text-sm">
            {searchTerm ? "No box prints match your search." : "No box prints yet."}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
            >
              Create your first box print
            </button>
          )}
        </div>
      )}

      {/* Box Prints Table */}
      {!isLoading && !loadError && filteredPrints.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Print Name</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPrints.map((print) => (
              <div key={print._id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <PrinterIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {print.printName}
                    </p>
                  </div>

                  <div className="col-span-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        print.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {print.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">
                      {new Date(print.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(print)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Box Print"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(print)}
                      disabled={deletingId === print._id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete Box Print"
                    >
                      {deletingId === print._id ? (
                        <Spinner className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingPrint ? "Edit Box Print" : "Create Box Print"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-100"
                type="button"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Name *
                </label>
                <input
                  type="text"
                  value={form.printName}
                  onChange={(e) =>
                    setForm({ ...form, printName: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., Full Color, Monochrome, Embossed"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Name of the print type for boxes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Spinner />}
                  {editingPrint
                    ? isSubmitting
                      ? "Updating..."
                      : "Update"
                    : isSubmitting
                    ? "Creating..."
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}