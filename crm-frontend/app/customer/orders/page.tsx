// app/customer/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getSavedCustomerInfo } from "@/lib/customerCart";
import {
  getAdminWhatsAppNumber,
  generateWhatsAppLink,
} from "@/lib/whatsapp";

const orderStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: ClockIcon },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircleIcon },
  processing: { label: "Processing", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: ArrowPathIcon },
  shipped: { label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200", icon: TruckIcon },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircleIcon },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircleIcon },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  useEffect(() => {
    const saved = getSavedCustomerInfo();
    const phoneToLoad = saved?.phone || "";
    setSearchPhone(phoneToLoad);
    fetchOrders(phoneToLoad);
  }, []);

  const fetchOrders = async (phone = "") => {
    setLoading(true);
    try {
      const url = phone ? `/api/orders?phone=${encodeURIComponent(phone)}` : "/api/orders";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error("Error loading orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchPhone);
  };

  const handleWhatsAppOrderInquiry = (order: any) => {
    const adminPhone = getAdminWhatsAppNumber();
    const text =
      `👋 Hello Admin,\n\n` +
      `I would like to inquire about my order status:\n` +
      `*Order #:* ${order.orderNumber}\n` +
      `*Customer:* ${order.customerDetails?.name}\n` +
      `*Total:* $${order.total.toFixed(2)}\n` +
      `*Current Status:* ${order.orderStatus.toUpperCase()}\n\n` +
      `Could you please update me on delivery dispatch? Thank you!`;

    const link = generateWhatsAppLink(adminPhone, text);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Title & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track current and past optical orders, review items & check shipping updates
          </p>
        </div>

        {/* Search by phone */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              placeholder="Filter by phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* ─── Orders List ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
          <ArrowPathIcon className="h-7 w-7 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-500 max-w-md mx-auto">
          <DocumentTextIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-800">No Orders Found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchPhone
              ? `No orders matching phone number ${searchPhone}.`
              : "You haven't placed any orders yet."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {searchPhone && (
              <button
                onClick={() => {
                  setSearchPhone("");
                  fetchOrders("");
                }}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Clear Phone Filter
              </button>
            )}
            <Link
              href="/customer"
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusMeta =
              orderStatusConfig[order.orderStatus] || orderStatusConfig.pending;
            const StatusIcon = statusMeta.icon;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-indigo-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <DocumentTextIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {order.orderNumber}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusMeta.label}
                    </span>
                    <span className="text-base font-extrabold text-indigo-600 ml-2">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-3">
                  <p className="text-2xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                    Items ({order.items?.length || 0})
                  </p>
                  <div className="space-y-1.5">
                    {order.items?.map((it: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{it.name}</span>
                          {it.color && (
                            <span className="px-1.5 py-0.5 rounded text-2xs bg-indigo-100 text-indigo-700 font-medium">
                              {it.color} ({it.quality || "Std"})
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600">
                          <span>
                            {it.quantity} x ${it.price.toFixed(2)} ={" "}
                            <b>${(it.quantity * it.price).toFixed(2)}</b>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    Delivery To: <b>{order.customerDetails?.name}</b> (
                    {order.customerDetails?.city || "Local"})
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrderInquiry(order)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      Track on WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveOrder(order)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                    >
                      View Details
                    </button>

                    <Link
                      href="/customer/bills"
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition"
                    >
                      View Bill
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Order Details Modal ─── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600">
                Order Receipt
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
                {activeOrder.orderNumber}
              </h2>
              <p className="text-xs text-gray-500">
                Date: {new Date(activeOrder.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
              <p className="font-bold text-gray-800">Shipping Details:</p>
              <p className="text-gray-600">
                {activeOrder.customerDetails?.name} ({activeOrder.customerDetails?.phone})
              </p>
              <p className="text-gray-600">
                {activeOrder.customerDetails?.address}, {activeOrder.customerDetails?.city} -{" "}
                {activeOrder.customerDetails?.pincode}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-700">Line Items:</p>
              <div className="divide-y divide-gray-100">
                {activeOrder.items?.map((it: any, idx: number) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{it.name}</p>
                      <p className="text-gray-500 text-2xs">
                        Color: {it.color || "Standard"} | Quality: {it.quality || "Standard"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(it.quantity * it.price).toFixed(2)}
                      </p>
                      <p className="text-2xs text-gray-400">
                        {it.quantity} x ${it.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${activeOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>${activeOrder.shipping?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total:</span>
                <span className="text-indigo-600">${activeOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleWhatsAppOrderInquiry(activeOrder)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Inquire on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
