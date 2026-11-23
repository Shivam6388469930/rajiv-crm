// services/auth.service.ts

const BASE_URL = "/api/auth";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

async function request<T = any>(
  path: string,
  body: Record<string, any>
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      return {
        success: false,
        message: "Unexpected server response. Please try again.",
      };
    }

    // Normalize non-2xx responses that don't already set `success: false`
    if (!res.ok && json.success === undefined) {
      return {
        success: false,
        message: json.message || "Something went wrong. Please try again.",
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

export const registerUser = (data: RegisterPayload) =>
  request("/register", data);

export const loginUser = (data: LoginPayload) => request("/login", data);

export const forgotPassword = (email: string) =>
  request("/forgot-password", { email });

export const verifyEmail = (email: string, otp: string) =>
  request("/verify-email", { email, otp });

export const resendOtp = (email: string) =>
  request("/resend-otp", { email });

export const resetPassword = (data: ResetPasswordPayload) =>
  request("/reset-password", data);

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
// Tokens are stored in localStorage for simplicity (matches the current
// backend, which returns the access token in the response body). For
// production, prefer having the backend set an HTTP-only cookie instead —
// see the note in AuthModals.tsx `handleLogin`.
//
// We additionally mirror a lightweight, non-sensitive flag into a regular
// cookie (`isLoggedIn=1`) purely so that Next.js middleware can redirect
// unauthenticated users away from protected routes. The real access token
// never goes into that cookie.

const TOKEN_KEY = "token";
const USER_KEY = "opticcrm_user";

export function setToken(token: string, user?: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    // 7 day, readable-by-middleware flag (not the token itself)
    document.cookie = `isLoggedIn=1; path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    if (user?.role) {
      document.cookie = `userRole=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }
}

export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
  }
}