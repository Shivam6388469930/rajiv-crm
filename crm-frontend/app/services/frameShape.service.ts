// app/services/frameShape.service.ts
export interface FrameShape {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface FrameShapeInput {
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/frame-shapes";

export async function getFrameShapes(): Promise<ApiResponse<FrameShape[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Frame shapes fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch frame shapes",
    };
  }
}

export async function getFrameShape(id: string): Promise<ApiResponse<FrameShape>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Frame shape fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch frame shape",
    };
  }
}

export async function createFrameShape(
  input: FrameShapeInput
): Promise<ApiResponse<FrameShape>> {
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
      message: data.message || "Frame shape created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create frame shape",
    };
  }
}

export async function updateFrameShape(
  id: string,
  input: Partial<FrameShapeInput>
): Promise<ApiResponse<FrameShape>> {
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
      message: data.message || "Frame shape updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update frame shape",
    };
  }
}

export async function deleteFrameShape(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Frame shape deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete frame shape",
    };
  }
}