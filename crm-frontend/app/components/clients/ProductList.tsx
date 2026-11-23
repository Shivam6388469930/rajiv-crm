// components/admin/products/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { getProducts, deleteProduct, Product } from "@/app/services/product.service";

interface ProductListProps {
  viewMode: "grid" | "list";
  onEdit: (product: any) => void;
  filters?: any;
}

const categoryColors: Record<string, string> = {
  frame: "bg-blue-50 text-blue-700",
  lens: "bg-purple-50 text-purple-700",
  contact_lens: "bg-green-50 text-green-700",
  cover: "bg-orange-50 text-orange-700",
  accessory: "bg-pink-50 text-pink-700",
  machine: "bg-red-50 text-red-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-50 text-gray-700",
  out_of_stock: "bg-red-50 text-red-700",
};

export default function ProductList({ viewMode, onEdit, filters }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    const res = await getProducts(filters);
    if (res.success && res.data) {
      setProducts(res.data);
    } else {
      setError(res.message || "Failed to load products");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts(products.filter(p => p._id !== id));
    } else {
      alert(res.message || "Failed to delete product");
    }
  };

  const getCategoryName = (category: any) => {
    if (typeof category === "object" && category !== null) {
      return category.name;
    }
    return category || "N/A";
  };

  const getSubcategoryName = (subcategory: any) => {
    if (typeof subcategory === "object" && subcategory !== null) {
      return subcategory.name;
    }
    return subcategory || "N/A";
  };

  const getBrandName = (brand: any) => {
    if (typeof brand === "object" && brand !== null) {
      return brand.brandName;
    }
    return brand || "N/A";
  };

  const getSupplierName = (supplier: any) => {
    if (typeof supplier === "object" && supplier !== null) {
      return supplier.supplierName;
    }
    return supplier || "N/A";
  };

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      let aVal = a[sortField as keyof Product];
      let bVal = b[sortField as keyof Product];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedProducts = sortProducts(products);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 py-12 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadProducts}
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedProducts.map((product) => {
          const primaryImage =
            product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
          return (
          <div
            key={product._id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Product Thumbnail & Category */}
              <div className="relative mb-3 h-36 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-2xs text-gray-400 mt-1">No Image</span>
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-2xs font-bold uppercase shadow-xs ${
                    categoryColors[getCategoryName(product.category).toLowerCase()] ||
                    "bg-gray-50 text-gray-700"
                  }`}
                >
                  {getCategoryName(product.category).replace("_", " ")}
                </span>
              </div>

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Color & Quality Variants Badges */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="mb-3 pt-1 border-t border-gray-100 flex flex-wrap gap-1">
                  {product.colorVariants.map((v: any, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {v.color} ({v.quality || "Std"}: {v.quantity})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-sm pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Selling Price</span>
                <span className="font-medium text-gray-900">${product.selling_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock</span>
                <span
                  className={`font-medium ${
                    product.stock <= (product.minimum_stock || 0)
                      ? "text-red-600 font-bold"
                      : "text-gray-900"
                  }`}
                >
                  {product.stock} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Brand</span>
                <span className="text-gray-700">{getBrandName(product.brand)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[product.status]
                  }`}
                >
                  {product.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
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
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
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
            {sortedProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">Sub: {getSubcategoryName(product.subcategory)}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[getCategoryName(product.category).toLowerCase()] || "bg-gray-50 text-gray-700"}`}
                  >
                    {getCategoryName(product.category).replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-gray-600">{product.sku}</span>
                  {product.barcode && (
                    <p className="text-xs font-mono text-gray-400">{product.barcode}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{getBrandName(product.brand)}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">${product.selling_price}</p>
                    <p className="text-xs text-gray-500">Cost: ${product.purchase_price}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${product.stock <= (product.minimum_stock || 0) ? "text-red-600" : "text-gray-900"}`}>
                    {product.stock}
                  </span>
                  {product.minimum_stock > 0 && (
                    <p className="text-xs text-gray-400">Min: {product.minimum_stock}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                    {product.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <TrashIcon className="h-4 w-4" />
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