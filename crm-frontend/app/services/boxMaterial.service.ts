// app/services/boxMaterial.service.ts
export interface BoxMaterial {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface BoxMaterialInput {
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/box-materials";

export async function getBoxMaterials(): Promise<ApiResponse<BoxMaterial[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box materials fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch box materials",
    };
  }
}

export async function getBoxMaterial(id: string): Promise<ApiResponse<BoxMaterial>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box material fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch box material",
    };
  }
}

export async function createBoxMaterial(
  input: BoxMaterialInput
): Promise<ApiResponse<BoxMaterial>> {
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
      message: data.message || "Box material created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create box material",
    };
  }
}

export async function updateBoxMaterial(
  id: string,
  input: Partial<BoxMaterialInput>
): Promise<ApiResponse<BoxMaterial>> {
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
      message: data.message || "Box material updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update box material",
    };
  }
}

export async function deleteBoxMaterial(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box material deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete box material",
    };
  }
}