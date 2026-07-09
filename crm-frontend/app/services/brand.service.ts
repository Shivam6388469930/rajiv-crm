// services/api/brand.service.ts
//
// This is the CLIENT-SIDE fetch layer (runs in the browser, calls your
// /api/brands routes). It's deliberately placed at services/api/ rather
// than services/ so it doesn't collide with your server-side
// services/brand.service.ts, which talks to Mongoose directly.

const BASE_URL = "/api/brands";

export interface Brand {
  id: string;
  brandName: string;
  slug: string;
  description: string;
  isActive: boolean;
  /** Category ObjectId as a string */
  category: string;
  /** Populated category name, present when the API populates `category` */
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandInput {
  brandName: string;
  slug: string;
  description?: string;
  isActive: boolean;
  category: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Normalizes a raw Mongoose document (or populated doc) into the shape the
// UI expects, and fills in safe defaults for anything missing.
function normalizeBrand(raw: any): Brand {
  const categoryField = raw?.category;
  const isPopulated =
    categoryField && typeof categoryField === "object" && !Array.isArray(categoryField);

  return {
    id: raw?.id ?? raw?._id ?? "",
    brandName: raw?.brandName ?? "",
    slug: raw?.slug ?? "",
    description: raw?.description ?? "",
    isActive: raw?.isActive !== false, // defaults true, matches schema default
    category: isPopulated
      ? categoryField.id ?? categoryField._id ?? ""
      : categoryField ?? "",
    categoryName: isPopulated ? categoryField.name ?? categoryField.categoryName : undefined,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      return {
        success: false,
        message: "Unexpected server response. Please try again.",
      };
    }

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

export const getBrands = async (): Promise<ApiResponse<Brand[]>> => {
  const res = await request<any[]>("");
  if (res.success && res.data) {
    return { ...res, data: res.data.map(normalizeBrand) };
  }
  return res as ApiResponse<Brand[]>;
};

export const getBrand = async (id: string): Promise<ApiResponse<Brand>> => {
  const res = await request<any>(`/${id}`);
  if (res.success && res.data) {
    return { ...res, data: normalizeBrand(res.data) };
  }
  return res as ApiResponse<Brand>;
};

export const createBrand = async (
  data: BrandInput
): Promise<ApiResponse<Brand>> => {
  const res = await request<any>("", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    return { ...res, data: normalizeBrand(res.data) };
  }
  return res as ApiResponse<Brand>;
};

export const updateBrand = async (
  id: string,
  data: Partial<BrandInput>
): Promise<ApiResponse<Brand>> => {
  const res = await request<any>(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    return { ...res, data: normalizeBrand(res.data) };
  }
  return res as ApiResponse<Brand>;
};

export const deleteBrand = (id: string) =>
  request<{ id: string }>(`/${id}`, {
    method: "DELETE",
  });