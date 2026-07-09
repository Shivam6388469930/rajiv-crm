// app/admin/lens-indices/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  LensIndex,
  LensIndexInput,
  getLensIndices,
  createLensIndex,
  updateLensIndex,
  deleteLensIndex,
  seedLensIndices,
} from "@/app/services/lensIndex.service";

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

const emptyForm: LensIndexInput = {
  value: "",
  label: "",
  status: "active",
};

export default function LensIndicesPage() {
  const [lensIndices, setLensIndices] = useState<LensIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<LensIndex | null>(null);
  const [form, setForm] = useState<LensIndexInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadLensIndices();
  }, []);

  async function loadLensIndices() {
    setIsLoading(true);
    setLoadError(null);

    const res = await getLensIndices();

    if (res.success && res.data) {
      setLensIndices(res.data);
    } else {
      setLoadError(res.message || "Could not load lens indices.");
    }

    setIsLoading(false);
  }

  async function handleSeedIndices() {
    if (!confirm("This will add default lens indices if they don't exist. Continue?")) {
      return;
    }

    setIsSeeding(true);
    const res = await seedLensIndices();
    setIsSeeding(false);

    if (res.success && res.data) {
      setLensIndices(res.data);
      alert("Lens indices seeded successfully!");
    } else {
      alert(res.message || "Failed to seed lens indices.");
    }
  }

  const filteredIndices = lensIndices.filter(
    (index) =>
      index.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      index.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingIndex(null);
    setForm({ ...emptyForm });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (index: LensIndex) => {
    setEditingIndex(index);
    setForm({
      value: index.value,
      label: index.label,
      status: index.status,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    setForm(emptyForm);
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!form.value.trim()) {
      setModalError("Value is required.");
      return;
    }
    if (!form.label.trim()) {
      setModalError("Label is required.");
      return;
    }

    const payload: LensIndexInput = {
      ...form,
      value: form.value.trim(),
      label: form.label.trim(),
    };

    setIsSubmitting(true);

    const res = editingIndex
      ? await updateLensIndex(editingIndex._id, payload)
      : await createLensIndex(payload);

    setIsSubmitting(false);

    if (res.success && res.data) {
      setLensIndices((prev) => {
        const exists = prev.some((s) => s._id === res.data!._id);
        return exists
          ? prev.map((s) => (s._id === res.data!._id ? res.data! : s))
          : [...prev, res.data!];
      });
      closeModal();
    } else {
      setModalError(
        res.message ||
          `Could not ${editingIndex ? "update" : "create"} lens index. Please try again.`
      );
    }
  };

  const handleDelete = async (index: LensIndex) => {
    if (!confirm(`Delete "${index.label}"? This cannot be undone.`)) return;

    setDeletingId(index._id);
    const res = await deleteLensIndex(index._id);
    setDeletingId(null);

    if (res.success) {
      setLensIndices((prev) => prev.filter((s) => s._id !== index._id));
    } else {
      alert(res.message || "Could not delete lens index.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lens Indices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage lens index values for your optical store
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeedIndices}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Spinner className="h-4 w-4 text-gray-700" />
                Seeding...
              </>
            ) : (
              <>
                <ChartBarIcon className="h-4 w-4" />
                Seed Default
              </>
            )}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            New Index
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search lens indices by value or label..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Spinner className="h-6 w-6 text-indigo-500" />
          <p className="text-sm">Loading lens indices...</p>
        </div>
      )}

      {/* Load error */}
      {!isLoading && loadError && (
        <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            onClick={loadLensIndices}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && filteredIndices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <ChartBarIcon className="h-8 w-8 text-gray-300" />
          <p className="text-sm">
            {searchTerm ? "No lens indices match your search." : "No lens indices yet."}
          </p>
          {!searchTerm && (
            <div className="flex gap-3">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
              >
                Create your first index
              </button>
              <button
                onClick={handleSeedIndices}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Seed default indices
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lens Indices Table */}
      {!isLoading && !loadError && filteredIndices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Value</div>
              <div className="col-span-5">Label</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredIndices.map((index) => (
              <div key={index._id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">{index.value}</span>
                    </div>
                  </div>

                  <div className="col-span-5">
                    <p className="text-sm font-medium text-gray-900">
                      {index.label}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        index.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(index)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Lens Index"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      disabled={deletingId === index._id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete Lens Index"
                    >
                      {deletingId === index._id ? (
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
                {editingIndex ? "Edit Lens Index" : "Create Lens Index"}
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
                  Value *
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., 1.50, 1.60, 1.74"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Numeric value like 1.50, 1.60, 1.74
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., 1.50 Standard"
                  required
                />
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
                  {editingIndex
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