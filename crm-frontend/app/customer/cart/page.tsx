// app/customer/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrashIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  CartItem,
  getSavedCustomerInfo,
  saveCustomerInfo,
} from "@/lib/customerCart";

export default function CartCheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "cash_on_delivery",
    notes: "",
  });

  useEffect(() => {
    setCart(getCartItems());
    const saved = getSavedCustomerInfo();
    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const tax = 0; // standard inclusive
  const shipping = subtotal > 150 ? 0 : cart.length > 0 ? 15 : 0;
  const total = subtotal + tax + shipping;

  const handleQty = (id: string, newQty: number) => {
    updateCartQuantity(id, newQty);
    setCart(getCartItems());
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setCart(getCartItems());
  };

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in your name, phone number, and delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      // Save customer info in localStorage for future orders
      saveCustomerInfo({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
      });

      const orderPayload = {
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        items: cart.map((c) => ({
          product: c.product_id,
          name: c.name,
          sku: c.sku,
          color: c.color,
          quality: c.quality,
          quantity: c.quantity,
          price: c.price,
          total: c.price * c.quantity,
          imageUrl: c.imageUrl,
        })),
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setOrderResult(json.data);
        clearCart();
        setCart([]);
      } else {
        alert(json.message || "Failed to place order.");
      }
    } catch (err: any) {
      alert("Order placement error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Order Placed Success Screen ───
  if (orderResult) {
    const { order, invoice, whatsappUrl } = orderResult;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed!
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Thank You for Your Order!
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Your order <b>#{order.orderNumber}</b> has been received and registered.
            {invoice && (
              <>
                {" "}
                Invoice <b>#{invoice.invoice_number}</b> has been generated.
              </>
            )}
          </p>

          <div className="my-6 p-4 rounded-xl bg-gray-50 text-left text-xs space-y-2 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Name:</span>
              <span className="font-semibold text-gray-900">{order.customerDetails?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone Number:</span>
              <span className="font-semibold text-gray-900">{order.customerDetails?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-bold text-gray-900 text-sm">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-semibold text-gray-900 capitalize">
                {order.paymentMethod.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          {whatsappUrl && (
            <div className="mb-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Send Order Confirmation to Admin on WhatsApp
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/customer/bills"
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition"
            >
              View Order Bill & Invoice
            </Link>
            <Link
              href="/customer"
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty Cart State ───
  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBagIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          You haven't added any optical frames, lenses, or accessories to your cart yet.
        </p>
        <Link
          href="/customer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Browse Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/customer"
          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Shopping Cart & Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Cart Items List (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">
                Cart Items ({cart.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setCart([]);
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBagIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>

                    {/* Variant badge */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.color && (
                        <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-indigo-50 text-indigo-700">
                          Color: {item.color}
                        </span>
                      )}
                      {item.quality && (
                        <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-gray-100 text-gray-700">
                          Quality: {item.quality}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="font-bold text-gray-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-2xs text-gray-400">
                        ${item.price.toFixed(2)} ea
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Checkout Form & Summary (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4"
          >
            <h2 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">
              Customer & Delivery Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name / Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@optic.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Clinic / Optical Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vision Eye Care & Opticals"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Shop No, Street, Landmark"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="cash_on_delivery">Cash on Delivery (COD)</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="online">Online Payment / UPI</option>
                  <option value="credit_term">Credit Term (Bill / Invoice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or frame prescription notes..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Confirm & Place Order"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
