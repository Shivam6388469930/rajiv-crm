"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  UserPlusIcon,
  XMarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

interface Supplier {
  _id: string;
  supplierName: string;
  phone: string;
  email: string;
  shopLocation?: string;
}

interface ProductShortage {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  stock: number;
  minimum_stock: number;
  shortageUnits: number;
  recommendedReorder: number;
  isOutOfStock: boolean;
  isShortage: boolean;
  category?: { _id: string; name: string };
  brand?: { _id: string; brandName: string };
  supplier?: Supplier;
  images?: { url: string }[];
  colorVariants?: { color: string; quality?: string; quantity: number }[];
}

export default function StockShortagePage() {
  const [products, setProducts] = useState<ProductShortage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [metrics, setMetrics] = useState({ totalShortage: 0, totalOutOfStock: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<"shortage" | "out_of_stock" | "all">("shortage");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Quantity and supplier overrides map per product
  const [reorderQtyMap, setReorderQtyMap] = useState<Record<string, number>>({});
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<Record<string, string>>({});

  // Active modal for detailed order
  const [activeModalProduct, setActiveModalProduct] = useState<ProductShortage | null>(null);
  const [modalCustomNotes, setModalCustomNotes] = useState("");
  const [modalVariants, setModalVariants] = useState<{ color: string; quality?: string; qty: number }[]>([]);

  // Add Supplier modal state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [addingSupplier, setAddingSupplier] = useState(false);

  // Success alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("filter", filterType);
      if (selectedCategory) params.append("category", selectedCategory);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/stock-shortage?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setProducts(data.data.products || []);
        setSuppliers(data.data.suppliers || []);
        setCategories(data.data.categories || []);
        if (data.data.metrics) setMetrics(data.data.metrics);

        // Populate initial reorder quantities and suppliers
        const initialQty: Record<string, number> = {};
        const initialSupp: Record<string, string> = {};
        (data.data.products || []).forEach((p: ProductShortage) => {
          initialQty[p._id] = p.recommendedReorder || 25;
          if (p.supplier?._id) initialSupp[p._id] = p.supplier._id;
        });
        setReorderQtyMap(initialQty);
        setSelectedSupplierMap(initialSupp);
      }
    } catch (err) {
      console.error("Failed to load stock shortage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterType, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Trigger WhatsApp order for a single product
  const handleSendWhatsAppOrder = async (
    product: ProductShortage,
    customVariantList?: typeof modalVariants
  ) => {
    const suppId = selectedSupplierMap[product._id] || product.supplier?._id;
    const reqQty = reorderQtyMap[product._id] || product.recommendedReorder || 25;

    try {
      const res = await fetch("/api/stock-shortage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          supplierId: suppId,
          requiredQuantity: reqQty,
          customNotes: modalCustomNotes,
          variants: customVariantList || [],
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.whatsAppUrl) {
        window.open(data.data.whatsAppUrl, "_blank");
        setToastMessage(`WhatsApp Purchase Order generated for ${product.name}!`);
        setTimeout(() => setToastMessage(null), 4000);
        if (activeModalProduct) setActiveModalProduct(null);
      } else {
        alert(data.message || "Failed to generate WhatsApp order");
      }
    } catch (err) {
      console.error("Error creating stock PO:", err);
    }
  };

  const openProductDetailModal = (prod: ProductShortage) => {
    setActiveModalProduct(prod);
    setModalCustomNotes("");
    if (prod.colorVariants && prod.colorVariants.length > 0) {
      setModalVariants(
        prod.colorVariants.map((v) => ({
          color: v.color,
          quality: v.quality,
          qty: 10,
        }))
      );
    } else {
      setModalVariants([]);
    }
  };

  const handleAddNewSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim() || !newSupplierPhone.trim()) return;

    try {
      setAddingSupplier(true);
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: newSupplierName.trim(),
          phone: newSupplierPhone.trim(),
          email: newSupplierEmail.trim() || `${newSupplierName.toLowerCase().replace(/\s+/g, "")}@optics.com`,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuppliers((prev) => [...prev, data.data]);
        if (activeModalProduct) {
          setSelectedSupplierMap((prev) => ({
            ...prev,
            [activeModalProduct._id]: data.data._id,
          }));
        }
        setIsAddSupplierOpen(false);
        setNewSupplierName("");
        setNewSupplierPhone("");
        setNewSupplierEmail("");
      } else {
        alert(data.message || "Failed to create supplier");
      }
    } catch (err) {
      console.error("Supplier creation error:", err);
    } finally {
      setAddingSupplier(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </span>
            Stock Shortage & WhatsApp Supplier Reorders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor depleted optical inventory, identify stock deficits, and instantly dispatch purchase orders to suppliers via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-xs"
          >
            <UserPlusIcon className="w-4 h-4 text-gray-500" />
            + Add Supplier
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition shadow-xs"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
            Critical Shortage
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{metrics.totalShortage}</p>
          <p className="text-[11px] text-gray-400 mt-1">Stock ≤ Minimum threshold</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider block">
            Zero Stock / Out of Stock
          </span>
          <p className="text-3xl font-extrabold text-red-700 mt-1">{metrics.totalOutOfStock}</p>
          <p className="text-[11px] text-gray-400 mt-1">Immediate reorder required</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Active Suppliers
          </span>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{suppliers.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Ready for WhatsApp dispatch</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            Total Optical SKUs
          </span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">{metrics.totalProducts}</p>
          <p className="text-[11px] text-gray-400 mt-1">All tracked catalog items</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Tabs */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-0.5 text-xs">
            <button
              onClick={() => setFilterType("shortage")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === "shortage"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Shortage ({metrics.totalShortage})
            </button>
            <button
              onClick={() => setFilterType("out_of_stock")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === "out_of_stock"
                  ? "bg-red-700 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Zero Stock ({metrics.totalOutOfStock})
            </button>
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterType === "all"
                  ? "bg-gray-800 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Items ({metrics.totalProducts})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shortage Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-xs">Scanning inventory stock levels...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Shortage Detected!</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              All inventory items in this filter meet or exceed their minimum threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category / Brand</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Min. Stock</th>
                  <th className="py-3 px-4 text-center">Deficit</th>
                  <th className="py-3 px-4">Assigned Supplier</th>
                  <th className="py-3 px-4 text-center">Reorder Qty</th>
                  <th className="py-3 px-4 text-right">Instant Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const img = prod.images?.[0]?.url;
                  const currentSuppId = selectedSupplierMap[prod._id] || prod.supplier?._id || "";
                  const currentReqQty = reorderQtyMap[prod._id] ?? prod.recommendedReorder;
                  const isCritical = prod.stock <= 0;

                  return (
                    <tr
                      key={prod._id}
                      className={`hover:bg-gray-50/70 transition ${
                        isCritical ? "bg-red-50/20" : prod.isShortage ? "bg-amber-50/15" : ""
                      }`}
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg border object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-sm flex-shrink-0">
                              👓
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-xs">
                              {prod.name}
                            </span>
                            <span className="text-[11px] font-mono text-gray-500">
                              SKU: {prod.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-indigo-700 block">
                          {prod.category?.name || "Optical"}
                        </span>
                        <span className="text-gray-500 text-[11px]">
                          {prod.brand?.brandName || "General"}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                            prod.stock <= 0
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : prod.stock <= prod.minimum_stock
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {prod.stock} pcs
                        </span>
                      </td>

                      {/* Min. Stock */}
                      <td className="py-3 px-4 text-center text-gray-500 font-medium">
                        {prod.minimum_stock} pcs
                      </td>

                      {/* Shortage Deficit */}
                      <td className="py-3 px-4 text-center">
                        {prod.shortageUnits > 0 ? (
                          <span className="text-rose-600 font-bold">
                            -{prod.shortageUnits} units
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Safe</span>
                        )}
                      </td>

                      {/* Supplier Selection */}
                      <td className="py-3 px-4">
                        <select
                          value={currentSuppId}
                          onChange={(e) =>
                            setSelectedSupplierMap((prev) => ({
                              ...prev,
                              [prod._id]: e.target.value,
                            }))
                          }
                          className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
                        >
                          <option value="">Select Supplier...</option>
                          {suppliers.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.supplierName} ({s.phone})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Reorder Quantity Input */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={1}
                          value={currentReqQty}
                          onChange={(e) =>
                            setReorderQtyMap((prev) => ({
                              ...prev,
                              [prod._id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-16 px-2 py-1 text-center font-bold border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </td>

                      {/* Instant WhatsApp Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openProductDetailModal(prod)}
                            className="px-2.5 py-1.5 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg text-xs font-semibold transition"
                            title="Configure detailed PO & variants"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppOrder(prod)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            title="Send WhatsApp Requirement to Supplier"
                          >
                            <PaperAirplaneIcon className="w-3.5 h-3.5 -rotate-45" />
                            WhatsApp PO
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed PO & Variants Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Create Stock Purchase Requisition
                </span>
                <h2 className="text-base font-bold text-gray-900">{activeModalProduct.name}</h2>
                <p className="text-xs text-gray-500 font-mono">SKU: {activeModalProduct.sku}</p>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Current Stock</span>
                <span className="text-base font-bold text-gray-900">
                  {activeModalProduct.stock} pcs
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Minimum Threshold</span>
                <span className="text-base font-bold text-gray-900">
                  {activeModalProduct.minimum_stock} pcs
                </span>
              </div>
            </div>

            {/* Supplier Choice */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Target Supplier
              </label>
              <select
                value={selectedSupplierMap[activeModalProduct._id] || ""}
                onChange={(e) =>
                  setSelectedSupplierMap((prev) => ({
                    ...prev,
                    [activeModalProduct._id]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName} - {s.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Variants Breakdown (if any) */}
            {modalVariants.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Color / Quality Breakdown
                </label>
                <div className="space-y-2 border border-gray-200 p-3 rounded-xl max-h-36 overflow-y-auto">
                  {modalVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-800">
                        {v.color} ({v.quality || "Standard"})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 text-[11px]">Require:</span>
                        <input
                          type="number"
                          min={0}
                          value={v.qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setModalVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, qty: val } : item))
                            );
                          }}
                          className="w-16 px-2 py-0.5 border border-gray-300 rounded text-center text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Special Instructions / Delivery Deadline
              </label>
              <input
                type="text"
                value={modalCustomNotes}
                onChange={(e) => setModalCustomNotes(e.target.value)}
                placeholder="e.g. Urgent requirement needed within 48 hours for customer order"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t pt-3">
              <button
                type="button"
                onClick={() => setActiveModalProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSendWhatsAppOrder(activeModalProduct, modalVariants)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewSupplier}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Add New Optical Supplier</h3>
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Supplier / Wholesaler Name
              </label>
              <input
                type="text"
                required
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="e.g. Apex Eyewear Distributors"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                WhatsApp / Phone Number
              </label>
              <input
                type="tel"
                required
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                placeholder="e.g. 919876543210 (with country code)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                placeholder="orders@supplier.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingSupplier}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
              >
                {addingSupplier ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
