"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, setToken } from "@/app/services/auth.service";
import {
  EyeIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (res.success) {
        if (res.data?.accessToken) {
          setToken(res.data.accessToken, res.data.user);
        }
        router.push("/customer");
      } else {
        setError(res.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setForm({
      email: "admin@gmail.com",
      password: "Admin@123",
    });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl shadow-md text-white mb-2">
            <EyeIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Optic<span className="text-indigo-600">CRM</span> Login
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to access your Optical Management Dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Admin Helper */}
        <div className="pt-2 border-t border-gray-100">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-indigo-900">Admin Account</p>
              <p className="text-[11px] text-indigo-600 font-mono mt-0.5">admin@gmail.com / Admin@123</p>
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="px-2.5 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-[11px]"
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center text-xs text-gray-500 pt-2 flex items-center justify-center gap-4">
          <Link href="/" className="hover:text-indigo-600 transition">
            ← Back to Homepage
          </Link>
          <span>•</span>
          <Link href="/customer" className="hover:text-indigo-600 transition">
            Customer Storefront ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
