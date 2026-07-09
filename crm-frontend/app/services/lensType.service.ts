// app/services/lensType.service.ts
export interface LensType {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface LensTypeInput {
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/lens-types";

export async function getLensTypes(): Promise<ApiResponse<LensType[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens types fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lens types",
    };
  }
}

export async function getLensType(id: string): Promise<ApiResponse<LensType>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens type fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch lens type",
    };
  }
}

export async function createLensType(
  input: LensTypeInput
): Promise<ApiResponse<LensType>> {
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
      message: data.message || "Lens type created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create lens type",
    };
  }
}

export async function updateLensType(
  id: string,
  input: Partial<LensTypeInput>
): Promise<ApiResponse<LensType>> {
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
      message: data.message || "Lens type updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update lens type",
    };
  }
}

export async function deleteLensType(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Lens type deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete lens type",
    };
  }
}