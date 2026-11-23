// // components/AuthModals.tsx
// "use client";

// import { Fragment, useRef } from "react";
// import { Dialog, Transition } from "@headlessui/react";
// import { XMarkIcon } from "@heroicons/react/24/outline";

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSwitchToRegister?: () => void;
//   onSwitchToLogin?: () => void;
// }

// export function LoginModal({
//   isOpen,
//   onClose,
//   onSwitchToRegister,
// }: ModalProps) {
//   const cancelButtonRef = useRef(null);

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog
//         as="div"
//         className="relative z-50"
//         initialFocus={cancelButtonRef}
//         onClose={onClose}
//       >
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-200"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-150"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-200"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-150"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                 <div className="flex justify-between items-center mb-4">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-xl font-bold text-gray-900"
//                   >
//                     Welcome back
//                   </Dialog.Title>
//                   <button
//                     onClick={onClose}
//                     className="rounded-full p-1 hover:bg-gray-100 transition"
//                   >
//                     <XMarkIcon className="h-5 w-5 text-gray-500" />
//                   </button>
//                 </div>

//                 <form className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       placeholder="name@example.com"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       placeholder="••••••••"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <label className="flex items-center gap-2 text-gray-600">
//                       <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
//                       Remember me
//                     </label>
//                     <a href="#" className="text-indigo-600 hover:underline">
//                       Forgot password?
//                     </a>
//                   </div>
//                   <button
//                     type="submit"
//                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm"
//                   >
//                     Log in
//                   </button>
//                 </form>

//                 <p className="mt-5 text-center text-sm text-gray-600">
//                   Don't have an account?{" "}
//                   <button
//                     onClick={onSwitchToRegister}
//                     className="font-medium text-indigo-600 hover:underline"
//                   >
//                     Sign up
//                   </button>
//                 </p>
//                 <div className="mt-4 flex items-center gap-3">
//                   <div className="h-px flex-1 bg-gray-200" />
//                   <span className="text-xs text-gray-400">or continue with</span>
//                   <div className="h-px flex-1 bg-gray-200" />
//                 </div>
//                 <div className="mt-4 grid grid-cols-2 gap-3">
//                   <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                     <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
//                     Google
//                   </button>
//                   <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                     <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
//                     Facebook
//                   </button>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

// export function RegisterModal({
//   isOpen,
//   onClose,
//   onSwitchToLogin,
// }: ModalProps) {
//   const cancelButtonRef = useRef(null);

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog
//         as="div"
//         className="relative z-50"
//         initialFocus={cancelButtonRef}
//         onClose={onClose}
//       >
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-200"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-150"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-200"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-150"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                 <div className="flex justify-between items-center mb-4">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-xl font-bold text-gray-900"
//                   >
//                     Create your account
//                   </Dialog.Title>
//                   <button
//                     onClick={onClose}
//                     className="rounded-full p-1 hover:bg-gray-100 transition"
//                   >
//                     <XMarkIcon className="h-5 w-5 text-gray-500" />
//                   </button>
//                 </div>

//                 <form className="space-y-4">
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         First name
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="Jane"
//                         className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Last name
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="Doe"
//                         className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       placeholder="name@example.com"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       placeholder="Create a strong password"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm"
//                   >
//                     Get started
//                   </button>
//                 </form>

//                 <p className="mt-5 text-center text-sm text-gray-600">
//                   Already have an account?{" "}
//                   <button
//                     onClick={onSwitchToLogin}
//                     className="font-medium text-indigo-600 hover:underline"
//                   >
//                     Log in
//                   </button>
//                 </p>
//                 <div className="mt-4 flex items-center gap-3">
//                   <div className="h-px flex-1 bg-gray-200" />
//                   <span className="text-xs text-gray-400">or sign up with</span>
//                   <div className="h-px flex-1 bg-gray-200" />
//                 </div>
//                 <div className="mt-4 grid grid-cols-2 gap-3">
//                   <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                     <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
//                     Google
//                   </button>
//                   <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                     <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
//                     Facebook
//                   </button>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

// components/AuthModals.tsx
"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyEmail,
  resendOtp,
  resetPassword,
  setToken,
} from "@/app/services/auth.service";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToForgotPassword?: () => void;
  /** Called after a successful register, with the email that needs verifying */
  onRegistered?: (email: string) => void;
  /** Called after a successful forgot-password request, with the email OTP was sent to */
  onOtpSent?: (email: string) => void;
  /** Called after email verification succeeds */
  onVerified?: () => void;
  /** Called after password reset succeeds */
  onResetComplete?: () => void;
  /** Email pre-filled for OTP / reset flows */
  email?: string;
}

function ModalShell({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition"
                    type="button"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
      {message}
    </div>
  );
}

const inputClasses =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-400";

const primaryButtonClasses =
  "w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition shadow-sm flex items-center justify-center gap-2";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
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

/* -------------------------------------------------------------------------- */
/*  Login Modal                                                               */
/* -------------------------------------------------------------------------- */

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: ModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const res = await loginUser(form);
    setLoading(false);

    if (res.success) {
      // Token comes back in the response body from the current API.
      // For production, prefer having the backend set this as an
      // HTTP-only cookie on /login instead of returning it in JSON —
      // that removes the token from JS-accessible storage entirely and
      // protects against XSS-based token theft.
      if (res.data?.accessToken) {
        setToken(res.data.accessToken, res.data.user);
      }
      onClose();
      router.push("/client");
    } else {
      setError(res.message || "Invalid email or password.");
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Welcome back">
      <ErrorBanner message={error} />

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className={inputClasses}
            disabled={loading}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={inputClasses}
            disabled={loading}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-indigo-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" className={primaryButtonClasses} disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-indigo-600 hover:underline"
          type="button"
        >
          Sign up
        </button>
      </p>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Register Modal                                                            */
/* -------------------------------------------------------------------------- */

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegistered,
}: ModalProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await registerUser(form);
    setLoading(false);

    if (res.success) {
      onRegistered?.(form.email);
    } else {
      setError(res.message || "Registration failed. Please try again.");
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Create your account">
      <ErrorBanner message={error} />

      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            className={inputClasses}
            disabled={loading}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className={inputClasses}
            disabled={loading}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Create a strong password"
            className={inputClasses}
            disabled={loading}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className={primaryButtonClasses} disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Creating account..." : "Get started"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-indigo-600 hover:underline"
          type="button"
        >
          Log in
        </button>
      </p>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Verify Email (OTP) Modal                                                  */
/* -------------------------------------------------------------------------- */

export function VerifyEmailModal({
  isOpen,
  onClose,
  onVerified,
  onSwitchToLogin,
  email = "",
}: ModalProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    const res = await verifyEmail(email, otp);
    setLoading(false);

    if (res.success) {
      setInfo("Email verified! You can now log in.");
      setTimeout(() => {
        onVerified?.();
        onSwitchToLogin?.();
      }, 900);
    } else {
      setError(res.message || "Invalid or expired OTP.");
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    const res = await resendOtp(email);
    setResending(false);

    if (res.success) {
      setInfo("A new OTP has been sent to your email.");
    } else {
      setError(res.message || "Could not resend OTP. Please try again.");
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Verify your email">
      <p className="text-sm text-gray-600 mb-4">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-gray-900">{email}</span>.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={info} />

      <form className="space-y-4" onSubmit={handleVerify}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OTP code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className={`${inputClasses} tracking-[0.5em] text-center font-semibold`}
            disabled={loading}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        <button type="submit" className={primaryButtonClasses} disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Didn&apos;t get a code?{" "}
        <button
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-indigo-600 hover:underline disabled:opacity-50"
          type="button"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </p>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Forgot Password Modal                                                     */
/* -------------------------------------------------------------------------- */

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onOtpSent,
  onSwitchToLogin,
}: ModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailInput) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const res = await forgotPassword(emailInput);
    setLoading(false);

    if (res.success) {
      onOtpSent?.(emailInput);
    } else {
      setError(res.message || "Could not find an account with that email.");
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Reset your password">
      <p className="text-sm text-gray-600 mb-4">
        Enter your email and we&apos;ll send you a code to reset your password.
      </p>

      <ErrorBanner message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className={inputClasses}
            disabled={loading}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={primaryButtonClasses} disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Sending code..." : "Send reset code"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Remembered your password?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-indigo-600 hover:underline"
          type="button"
        >
          Log in
        </button>
      </p>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reset Password Modal                                                      */
/* -------------------------------------------------------------------------- */

export function ResetPasswordModal({
  isOpen,
  onClose,
  onResetComplete,
  onSwitchToLogin,
  email = "",
}: ModalProps) {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await resetPassword({ email, otp, newPassword });
    setLoading(false);

    if (res.success) {
      setInfo("Password reset! You can now log in with your new password.");
      setTimeout(() => {
        onResetComplete?.();
        onSwitchToLogin?.();
      }, 900);
    } else {
      setError(res.message || "Invalid or expired code.");
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Set a new password">
      <p className="text-sm text-gray-600 mb-4">
        Enter the code sent to{" "}
        <span className="font-medium text-gray-900">{email}</span> and choose a
        new password.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={info} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OTP code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className={`${inputClasses} tracking-[0.5em] text-center font-semibold`}
            disabled={loading}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={inputClasses}
            disabled={loading}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={inputClasses}
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={primaryButtonClasses} disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Manager — wires all five modals together with a single piece of state     */
/* -------------------------------------------------------------------------- */

export type AuthView =
  | "login"
  | "register"
  | "verifyEmail"
  | "forgotPassword"
  | "resetPassword"
  | null;

interface AuthModalManagerProps {
  view: AuthView;
  onViewChange: (view: AuthView) => void;
  onClose: () => void;
}

/**
 * Drop this once near the root of your app (e.g. in layout.tsx) and control
 * it with a single `[authView, setAuthView]` state pair:
 *
 *   const [authView, setAuthView] = useState<AuthView>(null);
 *   <AuthModalManager
 *     view={authView}
 *     onViewChange={setAuthView}
 *     onClose={() => setAuthView(null)}
 *   />
 *
 * Open any modal from anywhere with setAuthView("login") / "register" / etc.
 */
export function AuthModalManager({
  view,
  onViewChange,
  onClose,
}: AuthModalManagerProps) {
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <>
      <LoginModal
        isOpen={view === "login"}
        onClose={onClose}
        onSwitchToRegister={() => onViewChange("register")}
        onSwitchToForgotPassword={() => onViewChange("forgotPassword")}
      />

      <RegisterModal
        isOpen={view === "register"}
        onClose={onClose}
        onSwitchToLogin={() => onViewChange("login")}
        onRegistered={(email) => {
          setPendingEmail(email);
          onViewChange("verifyEmail");
        }}
      />

      <VerifyEmailModal
        isOpen={view === "verifyEmail"}
        onClose={onClose}
        email={pendingEmail}
        onSwitchToLogin={() => onViewChange("login")}
      />

      <ForgotPasswordModal
        isOpen={view === "forgotPassword"}
        onClose={onClose}
        onSwitchToLogin={() => onViewChange("login")}
        onOtpSent={(email) => {
          setPendingEmail(email);
          onViewChange("resetPassword");
        }}
      />

      <ResetPasswordModal
        isOpen={view === "resetPassword"}
        onClose={onClose}
        email={pendingEmail}
        onSwitchToLogin={() => onViewChange("login")}
      />
    </>
  );
}