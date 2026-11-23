"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  EyeIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface OrderItem {
  product: string | { _id: string; name: string; sku?: string; images?: string[]; selling_price?: number };
  name: string;
  sku?: string;
  color?: string;
  quality?: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
  } | null;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  invoice?: {
    _id: string;
    invoice_number: string;
    total: number;
    paid: number;
    due: number;
    status: string;
  } | null;
  notes?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        let list: Order[] = data.data;
        if (paymentFilter !== "all") {
          list = list.filter((o) => o.paymentStatus === paymentFilter);
        }
        setOrders(list);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    newPaymentStatus?: string
  ) => {
    try {
      setUpdatingId(orderId);
      const payload: any = { orderStatus: newStatus };
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  orderStatus: newStatus as any,
                  ...(newPaymentStatus ? { paymentStatus: newPaymentStatus as any } : {}),
                }
              : o
          )
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  orderStatus: newStatus as any,
                  ...(newPaymentStatus ? { paymentStatus: newPaymentStatus as any } : {}),
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        if (selectedOrder?._id === orderId) setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const processingCount = orders.filter(
    (o) => o.orderStatus === "processing" || o.orderStatus === "confirmed"
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
      case "confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getWhatsAppChatUrl = (order: Order) => {
    const phone = order.customerDetails.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${order.customerDetails.name}, this is regarding your order #${order.orderNumber} for ₹${order.total.toFixed(2)}. Status: ${order.orderStatus.toUpperCase()}. How can we assist you today?`
    );
    return `https://wa.me/${phone.startsWith("91") || phone.length > 10 ? phone : `91${phone}`}?text=${text}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBagIcon className="w-7 h-7 text-indigo-600" />
            Customer Orders Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review incoming customer orders, manage fulfillment stages, track payment status, and communicate directly via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/customer"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
          >
            Visit Customer Storefront ↗
          </Link>
          <button
            onClick={() => fetchOrders()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending Orders</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">Requires action</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">In Fulfillment</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{processingCount}</p>
          <p className="text-xs text-gray-400 mt-1">Confirmed & processing</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Total Volume</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-emerald-600 mt-1">{deliveredCount} delivered</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:ring-indigo-500"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:ring-indigo-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              There are currently no orders matching your selected filters. Orders placed by customers on the storefront will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th className="py-3 px-4">Order Details</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items & Variants</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {order.invoice && (
                        <Link
                          href={`/client/invoice`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline mt-1"
                        >
                          <DocumentTextIcon className="w-3.5 h-3.5" />
                          {order.invoice.invoice_number}
                        </Link>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">{order.customerDetails.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{order.customerDetails.phone}</div>
                      {order.customerDetails.company && (
                        <div className="text-xs text-gray-400">{order.customerDetails.company}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 max-w-xs">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-8 h-8 rounded border border-gray-200 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                                👓
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-medium text-gray-800 text-xs truncate block">{item.name}</span>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                {item.color && (
                                  <span className="px-1.5 py-0.2 bg-gray-100 rounded text-gray-700">
                                    {item.color}
                                  </span>
                                )}
                                {item.quality && (
                                  <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-medium">
                                    {item.quality}
                                  </span>
                                )}
                                <span>x{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-[11px] text-gray-500 italic">
                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">₹{order.total.toFixed(2)}</div>
                      <div className="text-[11px] text-gray-500">
                        Subtotal: ₹{order.subtotal.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateOrderStatus(order._id, order.orderStatus, e.target.value)}
                        disabled={updatingId === order._id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.paymentStatus === "partial"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                      </select>
                      <div className="text-[10px] text-gray-400 mt-1 capitalize">
                        {order.paymentMethod.replace(/_/g, " ")}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition"
                          title="View order details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsAppChatUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                          title="WhatsApp customer"
                        >
                          <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete order"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-indigo-600">Order Slip</span>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-500 uppercase">Customer Info</p>
                <p className="font-bold text-gray-900 mt-1 text-sm">{selectedOrder.customerDetails.name}</p>
                <p className="text-gray-600 mt-0.5 font-mono">{selectedOrder.customerDetails.phone}</p>
                {selectedOrder.customerDetails.email && (
                  <p className="text-gray-600">{selectedOrder.customerDetails.email}</p>
                )}
                {selectedOrder.customerDetails.company && (
                  <p className="text-gray-600 italic">{selectedOrder.customerDetails.company}</p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-500 uppercase">Delivery Address</p>
                <p className="text-gray-800 mt-1 whitespace-pre-line">
                  {selectedOrder.customerDetails.address || "No street address provided"}
                  {selectedOrder.customerDetails.city ? `, ${selectedOrder.customerDetails.city}` : ""}
                  {selectedOrder.customerDetails.pincode ? ` - ${selectedOrder.customerDetails.pincode}` : ""}
                </p>
                <div className="mt-3">
                  <span className="text-gray-500">Payment: </span>
                  <span className="font-semibold capitalize text-gray-800">
                    {selectedOrder.paymentMethod.replace(/_/g, " ")} ({selectedOrder.paymentStatus})
                  </span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="border border-gray-200 rounded-xl divide-y overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                          👓
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                        {item.sku && <p className="text-[11px] font-mono text-gray-400">SKU: {item.sku}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          {item.color && (
                            <span className="px-2 py-0.5 bg-gray-100 border text-gray-700 rounded-md">
                              Color: {item.color}
                            </span>
                          )}
                          {item.quality && (
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md font-medium">
                              Quality: {item.quality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₹{item.total.toFixed(2)}</p>
                      <p className="text-gray-500 text-[11px]">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST)</span>
                <span className="font-medium text-gray-900">₹{selectedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">₹{selectedOrder.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                <span>Total Amount</span>
                <span className="text-indigo-600">₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-between border-t pt-4">
              <a
                href={getWhatsAppChatUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                WhatsApp Customer
              </a>

              <div className="flex items-center gap-2">
                {selectedOrder.invoice && (
                  <Link
                    href={`/client/invoice`}
                    className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    View Invoice
                  </Link>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
