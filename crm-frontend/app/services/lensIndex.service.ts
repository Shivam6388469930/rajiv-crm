// app/services/lensIndex.service.ts
export interface LensIndex {
  _id: string;
  value: string;
  label: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface LensIndexInput {
  value: string;
  label: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const LENS_INDICES_CONSTANTS = [
  { value: "1.50", label: "1.50 Standard" },
  { value: "1.53", label: "1.53 Trivex" },
  { value: "1.56", label: "1.56 Mid Index" },
  { value: "1.59", label: "1.59 Polycarbonate" },
  { value: "1.60", label: "1.60 High Index" },
  { value: "1.67", label: "1.67 High Index" },
  { value: "1.74", label: "1.74 Ultra Thin" }
];

const API_BASE = "/api/lens-indices";

export async function getLensIndices(): Promise<ApiResponse<LensIndex[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens indices fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lens indices",
    };
  }
}

export async function getLensIndex(id: string): Promise<ApiResponse<LensIndex>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens index fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lens index",
    };
  }
}

export async function createLensIndex(
  input: LensIndexInput
): Promise<ApiResponse<LensIndex>> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens index created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create lens index",
    };
  }
}

export async function updateLensIndex(
  id: string,
  input: Partial<LensIndexInput>
): Promise<ApiResponse<LensIndex>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens index updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update lens index",
    };
  }
}

export async function deleteLensIndex(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens index deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete lens index",
    };
  }
}

export async function seedLensIndices(): Promise<ApiResponse<LensIndex[]>> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seed: true }),
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens indices seeded successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to seed lens indices",
    };
  }
}