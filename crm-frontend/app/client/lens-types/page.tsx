// app/admin/lens-types/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  LensType,
  LensTypeInput,
  getLensTypes,
  createLensType,
  updateLensType,
  deleteLensType,
} from "@/app/services/lensType.service";

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

const emptyForm: LensTypeInput = {
  name: "",
  slug: "",
  status: "active",
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function LensTypesPage() {
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LensType | null>(null);
  const [form, setForm] = useState<LensTypeInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadLensTypes();
  }, []);

  async function loadLensTypes() {
    setIsLoading(true);
    setLoadError(null);

    const res = await getLensTypes();

    if (res.success && res.data) {
      setLensTypes(res.data);
    } else {
      setLoadError(res.message || "Could not load lens types.");
    }

    setIsLoading(false);
  }

  const filteredTypes = lensTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingType(null);
    setForm({ ...emptyForm });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: LensType) => {
    setEditingType(type);
    setForm({
      name: type.name,
      slug: type.slug,
      status: type.status,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setForm(emptyForm);
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!form.name.trim()) {
      setModalError("Lens type name is required.");
      return;
    }

    const payload: LensTypeInput = {
      ...form,
      slug: form.slug || generateSlug(form.name),
    };

    setIsSubmitting(true);

    const res = editingType
      ? await updateLensType(editingType._id, payload)
      : await createLensType(payload);

    setIsSubmitting(false);

    if (res.success && res.data) {
      setLensTypes((prev) => {
        const exists = prev.some((s) => s._id === res.data!._id);
        return exists
          ? prev.map((s) => (s._id === res.data!._id ? res.data! : s))
          : [...prev, res.data!];
      });
      closeModal();
    } else {
      setModalError(
        res.message ||
          `Could not ${editingType ? "update" : "create"} lens type. Please try again.`
      );
    }
  };

  const handleDelete = async (type: LensType) => {
    if (!confirm(`Delete "${type.name}"? This cannot be undone.`)) return;

    setDeletingId(type._id);
    const res = await deleteLensType(type._id);
    setDeletingId(null);

    if (res.success) {
      setLensTypes((prev) => prev.filter((s) => s._id !== type._id));
    } else {
      alert(res.message || "Could not delete lens type.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lens Types</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the lens types available in your optical store
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          New Lens Type
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search lens types by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Spinner className="h-6 w-6 text-indigo-500" />
          <p className="text-sm">Loading lens types...</p>
        </div>
      )}

      {/* Load error */}
      {!isLoading && loadError && (
        <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            onClick={loadLensTypes}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && filteredTypes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <EyeIcon className="h-8 w-8 text-gray-300" />
          <p className="text-sm">
            {searchTerm ? "No lens types match your search." : "No lens types yet."}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
            >
              Create your first lens type
            </button>
          )}
        </div>
      )}

      {/* Lens Types Table */}
      {!isLoading && !loadError && filteredTypes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTypes.map((type) => (
              <div key={type._id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <EyeIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {type.name}
                    </p>
                  </div>

                  <div className="col-span-3">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {type.slug}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        type.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {type.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">
                      {new Date(type.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(type)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Lens Type"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      disabled={deletingId === type._id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete Lens Type"
                    >
                      {deletingId === type._id ? (
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
                {editingType ? "Edit Lens Type" : "Create Lens Type"}
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
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., Progressive, Bifocal, Single Vision"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="progressive"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier. Auto-generated from name.
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
                  {editingType
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