// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Category,
  Subcategory,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  editSubcategory,
  removeSubcategory,
} from "@/app/services/category.service";

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Per-row "working" state so only the relevant button shows a spinner
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  // Modal form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*  Load categories                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setIsLoading(true);
    setLoadError(null);

    const res = await getCategories();

    if (res.success && res.data) {
     setCategories(res.data);
setExpandedCategories(
  new Set(res.data.map((c: any) => c.id))
);
    } else {
      setLoadError(res.message || "Could not load categories.");
    }

    setIsLoading(false);
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /* ---------------------------------------------------------------------- */
  /*  Category CRUD                                                         */
  /* ---------------------------------------------------------------------- */

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      setModalError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await createCategory({
      name: categoryForm.name,
      slug: categoryForm.slug || generateSlug(categoryForm.name),
      description: categoryForm.description,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setCategories((prev) => [...prev, { ...res.data!, subcategories: res.data!.subcategories || [] }]);
      setExpandedCategories((prev) => new Set(prev).add(res.data!.id));
      closeCategoryModal();
    } else {
      setModalError(res.message || "Could not create category.");
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      setModalError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await updateCategory(editingCategory.id, {
      name: categoryForm.name,
      slug: categoryForm.slug || generateSlug(categoryForm.name),
      description: categoryForm.description,
    });

    setIsSubmitting(false);

    if (res.success) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: categoryForm.name,
                slug: categoryForm.slug || generateSlug(categoryForm.name),
                description: categoryForm.description,
              }
            : cat
        )
      );
      closeCategoryModal();
    } else {
      setModalError(res.message || "Could not update category.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category and all its subcategories?"
      )
    ) {
      return;
    }

    setDeletingId(categoryId);
    const res = await deleteCategory(categoryId);
    setDeletingId(null);

    if (res.success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      const newExpanded = new Set(expandedCategories);
      newExpanded.delete(categoryId);
      setExpandedCategories(newExpanded);
    } else {
      alert(res.message || "Could not delete category.");
    }
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", description: "" });
    setModalError(null);
  };

  /* ---------------------------------------------------------------------- */
  /*  Subcategory CRUD                                                      */
  /*  (managed through PUT /api/categories/:id — see category.service.ts)  */
  /* ---------------------------------------------------------------------- */

  const handleAddSubcategory = async () => {
    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category || !subcategoryForm.name.trim()) {
      setModalError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await addSubcategory(category, {
      name: subcategoryForm.name,
      slug: subcategoryForm.slug || generateSlug(subcategoryForm.name),
      description: subcategoryForm.description,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? res.data! : cat))
      );
      closeSubcategoryModal();
    } else {
      setModalError(res.message || "Could not add subcategory.");
    }
  };

  const handleEditSubcategory = async () => {
    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category || !editingSubcategory || !subcategoryForm.name.trim()) {
      setModalError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await editSubcategory(category, editingSubcategory.id, {
      name: subcategoryForm.name,
      slug: subcategoryForm.slug || generateSlug(subcategoryForm.name),
      description: subcategoryForm.description,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? res.data! : cat))
      );
      closeSubcategoryModal();
    } else {
      setModalError(res.message || "Could not update subcategory.");
    }
  };

  const handleDeleteSubcategory = async (
    categoryId: string,
    subcategoryId: string
  ) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    setDeletingSubId(subcategoryId);
    const res = await removeSubcategory(category, subcategoryId);
    setDeletingSubId(null);

    if (res.success && res.data) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? res.data! : cat))
      );
    } else {
      alert(res.message || "Could not delete subcategory.");
    }
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setEditingSubcategory(null);
    setSelectedCategoryId(null);
    setSubcategoryForm({ name: "", slug: "", description: "" });
    setModalError(null);
  };

  /* ---------------------------------------------------------------------- */
  /*  Modal openers                                                         */
  /* ---------------------------------------------------------------------- */

  const openCategoryModal = (category?: Category) => {
    setModalError(null);
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "" });
    }
    setIsCategoryModalOpen(true);
  };

  const openSubcategoryModal = (categoryId: string, subcategory?: Subcategory) => {
    setModalError(null);
    setSelectedCategoryId(categoryId);
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description || "",
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({ name: "", slug: "", description: "" });
    }
    setIsSubcategoryModalOpen(true);
  };

  const getCategoryName = (id: string) => {
    return categories.find((cat) => cat.id === id)?.name || "";
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product categories and subcategories for your optical store
          </p>
        </div>
        <button
          onClick={() => openCategoryModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          New Category
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Spinner className="h-6 w-6 text-indigo-500" />
          <p className="text-sm">Loading categories...</p>
        </div>
      )}

      {/* Load error */}
      {!isLoading && loadError && (
        <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            onClick={loadCategories}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && categories.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
          <FolderIcon className="h-8 w-8 text-gray-300" />
          <p className="text-sm">No categories yet.</p>
          <button
            onClick={() => openCategoryModal()}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            Create your first category
          </button>
        </div>
      )}

      {/* Categories List */}
      {!isLoading && !loadError && categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Category</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Subcategories</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div key={category.id} className="hover:bg-gray-50 transition">
                {/* Category Row */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <FolderIcon className="h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-xs text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {category.subcategories.length}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openSubcategoryModal(category.id)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Add Subcategory"
                      >
                        <FolderPlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit Category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingId === category.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        title="Delete Category"
                      >
                        {deletingId === category.id ? (
                          <Spinner className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && (
                  <div className="bg-gray-50/50 border-t border-gray-100">
                    {category.subcategories.length === 0 ? (
                      <div className="px-12 py-4 text-sm text-gray-500 italic">
                        No subcategories yet. Click the folder icon to add one.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="px-12 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {sub.name}
                                </p>
                                {sub.description && (
                                  <p className="text-xs text-gray-500">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                                {sub.slug}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  openSubcategoryModal(category.id, sub)
                                }
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Edit Subcategory"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSubcategory(category.id, sub.id)
                                }
                                disabled={deletingSubId === sub.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                                title="Delete Subcategory"
                              >
                                {deletingSubId === sub.id ? (
                                  <Spinner className="h-3.5 w-3.5 text-red-500" />
                                ) : (
                                  <TrashIcon className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button
                onClick={closeCategoryModal}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingCategory ? handleEditCategory() : handleAddCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => {
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., Eyeglasses"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      slug: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="eyeglasses"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier. Auto-generated from name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none disabled:bg-gray-50"
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
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
                  {editingCategory
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

      {/* Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSubcategory
                  ? "Edit Subcategory"
                  : `Add Subcategory to "${getCategoryName(
                      selectedCategoryId || ""
                    )}"`}
              </h2>
              <button
                onClick={closeSubcategoryModal}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingSubcategory
                  ? handleEditSubcategory()
                  : handleAddSubcategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => {
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="e.g., Round Frames"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={subcategoryForm.slug}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      slug: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                  placeholder="round-frames"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier. Auto-generated from name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      description: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none disabled:bg-gray-50"
                  placeholder="Brief description of this subcategory"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
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
                  {editingSubcategory
                    ? isSubmitting
                      ? "Updating..."
                      : "Update"
                    : isSubmitting
                    ? "Adding..."
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