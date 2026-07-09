// components/admin/invoices/InvoiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any;
}

interface InvoiceItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

// Mock data
const mockCustomers = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sarah.j@eyeclinic.com", company: "Johnson Eye Clinic" },
  { id: "2", name: "Michael Chen", email: "michael.c@visioncare.com", company: "Vision Care Center" },
  { id: "3", name: "Emily Davis", email: "emily.d@optixstore.com", company: "Optix Store" },
];

const mockProducts = [
  { id: "1", name: "Aviator Gold Frame", sku: "FR-001", price: 299.99, stock: 45 },
  { id: "2", name: "Progressive Blue Light Lens", sku: "LN-045", price: 249.99, stock: 120 },
  { id: "3", name: "Daily Moisture Contact Lenses", sku: "CL-089", price: 49.99, stock: 500 },
  { id: "4", name: "Premium Spectacle Case", sku: "CV-034", price: 29.99, stock: 200 },
  { id: "5", name: "Microfiber Cleaning Cloth", sku: "AC-022", price: 5.99, stock: 1000 },
];

export default function InvoiceForm({ isOpen, onClose, invoice }: InvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: "",
    date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    discount_type: "percentage",
    discount_value: 0,
    tax_type: "percentage",
    tax_value: 0,
    shipping: 0,
    notes: "",
    terms: "",
  });

  useEffect(() => {
    if (invoice) {
      // Load invoice data for editing
      setSelectedCustomer(invoice.customer);
      setItems(invoice.items || []);
      setInvoiceData({
        invoice_number: invoice.invoice_number,
        date: invoice.date,
        due_date: invoice.due_date,
        discount_type: invoice.discount_type || "percentage",
        discount_value: invoice.discount_value || 0,
        tax_type: invoice.tax_type || "percentage",
        tax_value: invoice.tax_value || 0,
        shipping: invoice.shipping || 0,
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
    } else {
      // Generate invoice number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const count = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      setInvoiceData(prev => ({
        ...prev,
        invoice_number: `INV-${year}${month}-${count}`,
      }));
    }
  }, [invoice]);

  if (!isOpen) return null;

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product: any) => {
    const existingItem = items.find((item) => item.product_id === product.id);
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.price,
        discount: 0,
        tax: 0,
        total: product.price,
      };
      setItems([...items, newItem]);
    }
    setShowProductSearch(false);
    setSearchTerm("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity), total: Math.max(1, quantity) * item.price }
          : item
      )
    );
  };

  const updateItemPrice = (id: string, price: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, price: Math.max(0, price), total: item.quantity * Math.max(0, price) }
          : item
      )
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = (subtotal: number) => {
    if (invoiceData.discount_type === "percentage") {
      return (subtotal * invoiceData.discount_value) / 100;
    } else {
      return invoiceData.discount_value;
    }
  };

  const calculateTax = (subtotal: number, discount: number) => {
    const taxableAmount = subtotal - discount;
    if (invoiceData.tax_type === "percentage") {
      return (taxableAmount * invoiceData.tax_value) / 100;
    } else {
      return invoiceData.tax_value;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const tax = calculateTax(subtotal, discount);
    const shipping = invoiceData.shipping || 0;
    return subtotal - discount + tax + shipping;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const invoiceData = {
      customer: selectedCustomer,
      items,
      ...invoiceData,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(calculateSubtotal()),
      tax: calculateTax(calculateSubtotal(), calculateDiscount(calculateSubtotal())),
      total: calculateTotal(),
      status: "unpaid",
    };

    console.log("Invoice Data:", invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pt-2 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {invoice ? "Edit Invoice" : "New Invoice"}
            </h2>
            <p className="text-sm text-gray-500">
              {invoice ? `#${invoice.invoice_number}` : invoiceData.invoice_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
                  >
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.company}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={invoiceData.due_date}
                onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceData.invoice_number}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50"
                disabled
              />
            </div>
          </div>

          {/* Product Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Invoice Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
              >
                <PlusIcon className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {/* Product Search Modal */}
            {showProductSearch && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                    autoFocus
                  />
                </div>
                <div className="mt-3 max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product)}
                      className="w-full p-2 hover:bg-white rounded-lg transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${product.price}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No products found</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            )}

            {/* Items List */}
            {items.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs text-gray-500">{item.sku}</span>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                            step="0.01"
                            className="w-24 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-16 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  placeholder="Payment terms..."
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Discount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={invoiceData.discount_value}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discount_value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  />
                  <select
                    value={invoiceData.discount_type}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discount_type: e.target.value })}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Tax</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={invoiceData.tax_value}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax_value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  />
                  <select
                    value={invoiceData.tax_type}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax_type: e.target.value })}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Shipping</span>
                <input
                  type="number"
                  value={invoiceData.shipping}
                  onChange={(e) => setInvoiceData({ ...invoiceData, shipping: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-32 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                />
              </div>

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-sm"
            >
              {invoice ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}