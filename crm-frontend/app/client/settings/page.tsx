"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  DocumentCurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface SettingsState {
  companyName: string;
  email: string;
  phone: string;
  gstin: string;
  address: string;
  city: string;
  pincode: string;
  website: string;
  currencySymbol: string;
  defaultGstPercent: number;
  invoicePrefix: string;
  invoiceFooterNotes: string;
  termsAndConditions: string;
  whatsappNumber: string;
  whatsappApiToken: string;
  whatsappPhoneId: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  notifyOnNewOrder: boolean;
  sendWhatsAppOrderAlert: boolean;
  sendWhatsAppBillAlert: boolean;
}

const initialSettings: SettingsState = {
  companyName: "OpticCRM Solutions",
  email: "contact@opticcrm.com",
  phone: "+91 9876543210",
  gstin: "27AABCO1234F1Z5",
  address: "101 Optical Avenue, Eyecare Hub",
  city: "Mumbai",
  pincode: "400001",
  website: "https://opticcrm.com",
  currencySymbol: "₹",
  defaultGstPercent: 12,
  invoicePrefix: "INV",
  invoiceFooterNotes:
    "Thank you for choosing OpticCRM. All frames and lenses include a 1-year manufacturer warranty.",
  termsAndConditions:
    "1. Goods once sold can be returned or exchanged within 7 days with original receipt.\n2. Customized power lenses cannot be cancelled once processed in the laboratory.",
  whatsappNumber: "919876543210",
  whatsappApiToken: "",
  whatsappPhoneId: "",
  cloudinaryCloudName: "",
  cloudinaryApiKey: "",
  notifyOnNewOrder: true,
  sendWhatsAppOrderAlert: true,
  sendWhatsAppBillAlert: true,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "billing" | "integrations" | "seeding">("store");
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedResult, setSeedResult] = useState<any | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const [seedingProducts, setSeedingProducts] = useState<boolean>(false);
  const [seedProductsResult, setSeedProductsResult] = useState<any | null>(null);
  const [seedProductsError, setSeedProductsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "defaultGstPercent") {
      setSettings((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.message || "Failed to update settings");
      }
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleRunSeeding = async () => {
    setSeeding(true);
    setSeedResult(null);
    setSeedError(null);

    try {
      const res = await fetch("/api/seed/defaults", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedResult(data.data);
      } else {
        setSeedError(data.message || "Failed to seed default data");
      }
    } catch (err: any) {
      setSeedError(err.message || "Seeding error occurred");
    } finally {
      setSeeding(false);
    }
  };

  const handleRunProductSeeding = async () => {
    setSeedingProducts(true);
    setSeedProductsResult(null);
    setSeedProductsError(null);

    try {
      const res = await fetch("/api/seed/products", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedProductsResult(data.data);
      } else {
        setSeedProductsError(data.message || "Failed to seed optical products");
      }
    } catch (err: any) {
      setSeedProductsError(err.message || "Product seeding error occurred");
    } finally {
      setSeedingProducts(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Cog6ToothIcon className="w-7 h-7 text-indigo-600" />
            CRM & System Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your optical store profile, invoice rules, WhatsApp and Cloudinary integrations, or seed default master data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("store")}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "store"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <BuildingStorefrontIcon className="w-5 h-5" />
          Store Profile
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "billing"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <DocumentCurrencyRupeeIcon className="w-5 h-5" />
          Billing & Taxes
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "integrations"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          WhatsApp & Cloudinary
        </button>
        <button
          onClick={() => setActiveTab("seeding")}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "seeding"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <CircleStackIcon className="w-5 h-5" />
          Master Data & Seeding
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>System settings updated successfully. Changes are now active across your CRM.</span>
        </div>
      )}
      {saveError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tab 1: Store Profile */}
      {activeTab === "store" && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Store & Company Information</h2>
            <p className="text-xs text-gray-500">Details printed on official invoices, customer quotes, and receipts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Company / Optical Name</label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Official GSTIN Number</label>
              <input
                type="text"
                name="gstin"
                value={settings.gstin}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Support Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">City / State</label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Postal Pincode</label>
              <input
                type="text"
                name="pincode"
                value={settings.pincode}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Website URL</label>
              <input
                type="url"
                name="website"
                value={settings.website}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Billing & Taxes */}
      {activeTab === "billing" && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Billing, GST & Invoice Rules</h2>
            <p className="text-xs text-gray-500">Configure tax rates, prefixes, and legal terms displayed on bills.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                name="defaultGstPercent"
                value={settings.defaultGstPercent}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
              />
              <span className="text-[11px] text-gray-400">Common optical GST in India is 12% (6% CGST + 6% SGST)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Currency Symbol</label>
              <input
                type="text"
                name="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                name="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Invoice Footer Note</label>
              <input
                type="text"
                name="invoiceFooterNotes"
                value={settings.invoiceFooterNotes}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
              Save Billing Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Integrations */}
      {activeTab === "integrations" && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900">WhatsApp & Cloudinary Integrations</h2>
            <p className="text-xs text-gray-500">
              Configure communication channels and Cloudinary cloud storage for high-definition product images.
            </p>
          </div>

          {/* WhatsApp Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              WhatsApp Business Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Admin WhatsApp Mobile Number
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g. 919876543210 (with country code)"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-[11px] text-gray-400">
                  Customer storefront and cart will direct one-click WhatsApp inquiries and orders to this number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Meta WhatsApp Phone Number ID (Optional)
                </label>
                <input
                  type="text"
                  name="whatsappPhoneId"
                  value={settings.whatsappPhoneId}
                  onChange={handleChange}
                  placeholder="e.g. 109876543210987"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  WhatsApp Cloud API Access Token (Optional)
                </label>
                <input
                  type="password"
                  name="whatsappApiToken"
                  value={settings.whatsappApiToken}
                  onChange={handleChange}
                  placeholder="EAAG..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cloudinary Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CloudArrowUpIcon className="w-5 h-5 text-indigo-500" />
              Cloudinary Media Storage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Cloud Name</label>
                <input
                  type="text"
                  name="cloudinaryCloudName"
                  value={settings.cloudinaryCloudName}
                  onChange={handleChange}
                  placeholder="e.g. opticcrm-cloud"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">API Key</label>
                <input
                  type="text"
                  name="cloudinaryApiKey"
                  value={settings.cloudinaryApiKey}
                  onChange={handleChange}
                  placeholder="e.g. 841284719238472"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Note: Full credentials (including `CLOUDINARY_API_SECRET`) are also safely loaded from `.env`.
            </p>
          </div>

          {/* Alerts & Notifications */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-bold text-gray-900">Alert Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyOnNewOrder"
                  checked={settings.notifyOnNewOrder}
                  onChange={handleChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Send email notification on receiving new customer orders
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="sendWhatsAppOrderAlert"
                  checked={settings.sendWhatsAppOrderAlert}
                  onChange={handleChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Enable pre-filled WhatsApp confirmation links for customer checkout
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="sendWhatsAppBillAlert"
                  checked={settings.sendWhatsAppBillAlert}
                  onChange={handleChange}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Enable WhatsApp invoice dispatch option
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
              Save Integrations
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Master Data & Seeding */}
      {activeTab === "seeding" && (
        <div className="space-y-6">
          {/* Seeding Action Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="px-3 py-1 bg-indigo-700/60 text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                Optical Master Data Seeder
              </span>
              <h2 className="text-2xl font-bold">Populate Default Optical Master Catalog</h2>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Automatically populate required optical categories (Frames, Lenses, Contact Lenses, Cases, Accessories, Machinery),
                subcategories, leading optical brands (Ray-Ban, Oakley, Essilor, Zeiss), standard Frame Shapes, Lens Indices (1.50 to 1.74),
                Lens Types, Box Materials, and Box Print Types with zero duplicates.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleRunSeeding}
                  disabled={seeding}
                  className="px-5 py-2.5 bg-white text-indigo-900 font-bold text-sm rounded-xl hover:bg-indigo-50 transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {seeding ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Seeding Master Data...
                    </>
                  ) : (
                    <>
                      <CircleStackIcon className="w-5 h-5 text-indigo-600" />
                      Seed Default Master Data Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seed Feedback */}
          {seedResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                Default Master Data Populated Successfully!
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Categories</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.categoriesAdded} new ({seedResult.categoriesExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Brands</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.brandsAdded} new ({seedResult.brandsExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Frame Shapes</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.frameShapesAdded} new ({seedResult.frameShapesExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Lens Indices</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.lensIndicesAdded} new ({seedResult.lensIndicesExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Lens Types</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.lensTypesAdded} new ({seedResult.lensTypesExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Box Materials</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.boxMaterialsAdded} new ({seedResult.boxMaterialsExisting} verified)
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-gray-500 block">Box Print Types</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    +{seedResult.boxPrintsAdded} new ({seedResult.boxPrintsExisting} verified)
                  </span>
                </div>
              </div>
            </div>
          )}

          {seedError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{seedError}</span>
            </div>
          )}

          {/* Product Seeding Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="px-3 py-1 bg-emerald-700/60 text-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                Catalog Inventory Seeder
              </span>
              <h2 className="text-2xl font-bold">Populate 5 Products in Each Category & Subcategory</h2>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Automatically generate 5 realistic optical products for every single category and subcategory (Metal & Acetate frames, Progressive & Blue-cut lenses, Contact lenses, Hard cases, Tools, Machinery) complete with color variants, wholesale/retail pricing, SKUs, and HD optical images.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleRunProductSeeding}
                  disabled={seedingProducts}
                  className="px-5 py-2.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {seedingProducts ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Seeding 5 Products per Subcategory...
                    </>
                  ) : (
                    <>
                      <CircleStackIcon className="w-5 h-5 text-emerald-600" />
                      Seed 5 Products per Subcategory Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Product Seed Feedback */}
          {seedProductsResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                Products Successfully Seeded! Added {seedProductsResult.totalCreated} new optical products across {seedProductsResult.subcategoriesProcessed} subcategories.
              </div>
              <p className="text-xs text-emerald-700">
                Visit the <Link href="/client/products" className="underline font-semibold">Products Inventory</Link> page or the <Link href="/customer" target="_blank" className="underline font-semibold">Customer Storefront</Link> to view them.
              </p>
            </div>
          )}

          {seedProductsError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{seedProductsError}</span>
            </div>
          )}

          {/* Quick Links to Master Data Modules */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Manage Seeded Optical Master Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/client/categories"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Categories & Subcategories</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Frames, Lenses, Contact Lenses, Cases, Accessories, Machinery</p>
              </Link>

              <Link
                href="/client/brand"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Brands</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Ray-Ban, Oakley, Velocity, Fastrack, Essilor, Zeiss, Bausch & Lomb</p>
              </Link>

              <Link
                href="/client/frame-shapes"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Frame Shapes</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Aviator, Wayfarer, Round, Rectangle, Cat Eye, Geometric</p>
              </Link>

              <Link
                href="/client/lens-indices"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Lens Indices</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">1.50 CR-39, 1.56 Thin, 1.59 Polycarb, 1.60, 1.67, 1.74 Ultra Thin</p>
              </Link>

              <Link
                href="/client/lens-types"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Lens Types</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Single Vision, Bifocal D-Seg, Progressive, Blue Cut, Photochromic</p>
              </Link>

              <Link
                href="/client/box-materials"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Box Materials</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leatherette, Hard Plastic, Metal Clamshell, Bamboo Wood, Kraft Paper</p>
              </Link>

              <Link
                href="/client/box-prints"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">Box Print Types</h4>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Gold Foil Stamping, Silver Foil, Embossed 3D, UV Screen Print</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
