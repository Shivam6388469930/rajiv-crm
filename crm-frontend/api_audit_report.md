# API Audit Report — rajiv-crm Frontend

## Summary

The frontend has **14 API route folders** and **1 middleware** in `/app/api/`. After cross-referencing all client pages, service files, and components, here is the full breakdown.

---

## ✅ APIs That Are Correctly Implemented

| API Route | Methods | Frontend Service | Status |
|---|---|---|---|
| `/api/auth/register` | POST | `auth.service.ts` → `registerUser()` | ✅ OK |
| `/api/auth/login` | POST | `auth.service.ts` → `loginUser()` | ✅ OK |
| `/api/auth/logout` | POST | `auth.service.ts` → `clearToken()` | ✅ OK |
| `/api/auth/forgot-password` | POST | `auth.service.ts` → `forgotPassword()` | ✅ OK |
| `/api/auth/resend-otp` | POST | `auth.service.ts` → `resendOtp()` | ✅ OK |
| `/api/auth/verify-email` | POST | `auth.service.ts` → `verifyEmail()` | ✅ OK |
| `/api/brands` + `/[id]` | GET, POST, PUT, DELETE | `app/services/brand.service.ts` | ✅ OK |
| `/api/categories` + `/[id]` | GET, POST, PUT, DELETE | `app/services/category.service.ts` | ✅ OK |
| `/api/customers` + `/[id]` | GET, POST, PUT, DELETE | `app/services/customer.service.ts` | ✅ OK |
| `/api/frame-shapes` + `/[id]` | GET, POST, PUT, DELETE | `app/services/frameShape.service.ts` | ✅ OK |
| `/api/box-materials` + `/[id]` | GET, POST, PUT, DELETE | `app/services/boxMaterial.service.ts` | ✅ OK |
| `/api/box-prints` + `/[id]` | GET, POST, PUT, DELETE | `app/services/boxPrint.service.ts` | ✅ OK |
| `/api/lens-indices` + `/[id]` | GET, POST, PUT, DELETE | `app/services/lensIndex.service.ts` | ✅ OK |
| `/api/lens-types` + `/[id]` | GET, POST, PUT, DELETE | `app/services/lensType.service.ts` | ✅ OK |
| `/api/suppliers` + `/[id]` | GET, POST, PUT, DELETE | `app/services/supplier.service.ts` | ✅ OK |
| `/api/products` + `/[id]` | GET, POST, PUT, DELETE | `app/services/product.service.ts` | ✅ OK |

---

## ❌ Missing APIs (No Route Exists)

### 1. `/api/invoices` — **Completely Missing**
- **Page**: `/app/client/invoice/page.tsx` exists with full UI
- **Components used**: `InvoiceList`, `InvoiceForm`, `InvoiceDetail`, `PaymentModal`
- **Status**: `InvoiceList` currently uses **hardcoded mock data** (no fetch calls at all)
- **`InvoiceForm`** and **`PaymentModal`** submit handlers only `console.log()` data — they do NOT call any API
- **Model**: No `Invoice.ts` model exists in `/models/`
- **Needed routes**:
  - `GET /api/invoices` — list all invoices
  - `POST /api/invoices` — create invoice
  - `GET /api/invoices/[id]` — get one
  - `PUT /api/invoices/[id]` — update
  - `DELETE /api/invoices/[id]` — delete
  - `POST /api/invoices/[id]/payments` — record a payment (PaymentModal)

### 2. `/api/auth/me` — **Route Exists But Is Never Called**
- The route `GET /api/auth/me` exists and is fully implemented
- But **no service function** calls it (not in `app/services/auth.service.ts`)
- No component fetches the current logged-in user from the API
- Auth state is only managed via `localStorage` token — no session hydration on page load

---

## ⚠️ APIs With Issues / Bugs

### 1. `POST /api/auth/reset-password` — **Field Name Mismatch**
- **File**: `app/api/auth/reset-password/route.js` (note: `.js`, not `.ts`)
- **API expects**: `{ email, password }` (destructures `password` from body)
- **Frontend sends**: `{ email, otp, newPassword }` (from `ResetPasswordPayload` interface in `auth.service.ts`)
- **Result**: The API receives `newPassword` but reads `password` → `password` is `undefined` → `hashPassword(undefined)` is called → password is never actually updated
- **Also**: OTP is not verified inside `reset-password` route. It assumes `verify-reset-otp` was called separately, but the frontend's `ResetPasswordModal` sends both `otp` AND `newPassword` in a **single request** to `/reset-password` — so OTP verification is skipped entirely.

### 2. `POST /api/auth/reset-password` — **Wrong File Extension (.js instead of .ts)**
- All other routes are `.ts` but this one is `.js`
- It imports from `@/models/User` which does **not exist** — the model file is named `users.ts` (lowercase)
- **Import**: `import User from "@/models/User"` → will throw `Module not found` at runtime
- **Fix**: Rename to `route.ts` and change import to `@/models/users`

### 3. `GET /api/auth/me` — **Authorization Logic Is Inconsistent**
- The route reads the token from the `Authorization: Bearer <token>` header
- But `app/services/auth.service.ts` **never calls** this endpoint, and no component passes the token in headers
- The `verify-reset-otp` endpoint exists (`app/api/auth/verify-reset-otp/route.ts`) and is functional, but the frontend's reset flow skips it and tries to verify + reset in one step via the broken `/reset-password` route

### 4. `POST /api/auth/forgot-password` — **Missing Error Handling**
- File: `app/api/auth/forgot-password/route.ts`
- No `try/catch` block — if the email is not found or OTP creation fails, the server will crash with a 500 instead of returning a clean error
- Compare with `resend-otp/route.ts` which does have a try/catch

### 5. Duplicate Service Directories
- There are **two separate `services/` directories**:
  - `/crm-frontend/services/` — server-side DB services (used by API routes)
  - `/crm-frontend/app/services/` — client-side fetch wrappers (used by components)
- The root `/services/` folder has **no** `invoice.service.ts`, `auth.service.ts` is only in `app/services/`
- This creates confusion: `auth.service.ts` in `app/services/` is the client-side one; there's a separate `auth.service.ts` in root `/services/` that is a server-side DB service (login/register logic)

### 6. `GET /api/users` — **Incomplete Route**
- File: `app/api/users/route.ts`
- Currently only tests MongoDB connection — returns `{ success: true, message: "MongoDB Connected" }`
- No actual user listing, filtering, or management logic
- The sidebar has no "Users" page but the route exists as a skeleton

---

## 📋 What Needs To Be Done

### Must Fix (Bugs)
1. **`reset-password/route.js`**: Rename to `.ts`, fix model import to `@/models/users`, change field to `newPassword`, and add OTP verification logic inside the route
2. **`forgot-password/route.ts`**: Wrap in `try/catch` and return proper error response

### Must Create (Missing APIs)
3. **`/api/invoices/route.ts`** — GET (list) + POST (create)
4. **`/api/invoices/[id]/route.ts`** — GET, PUT, DELETE
5. **`/api/invoices/[id]/payments/route.ts`** — POST (record payment)
6. **`/models/Invoice.ts`** — Mongoose model for invoices

### Should Fix (Incomplete)
7. **`/api/auth/me`** — Add a call to this in `auth.service.ts` so the frontend can load user profile on page refresh
8. **`/api/users/route.ts`** — Implement actual user management (list, create) or remove if not needed
9. **`InvoiceList.tsx`** — Replace mock data with real `fetch('/api/invoices')`
10. **`InvoiceForm.tsx`** — Replace `console.log` with actual `POST /api/invoices` or `PUT /api/invoices/[id]`
11. **`PaymentModal.tsx`** — Replace `console.log` with actual `POST /api/invoices/[id]/payments`
