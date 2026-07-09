// app/services/boxPrint.service.ts
export interface BoxPrint {
  _id: string;
  printName: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface BoxPrintInput {
  printName: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/box-prints";

export async function getBoxPrints(): Promise<ApiResponse<BoxPrint[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box prints fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch box prints",
    };
  }
}

export async function getBoxPrint(id: string): Promise<ApiResponse<BoxPrint>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box print fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch box print",
    };
  }
}

export async function createBoxPrint(
  input: BoxPrintInput
): Promise<ApiResponse<BoxPrint>> {
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
      message: data.message || "Box print created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create box print",
    };
  }
}

export async function updateBoxPrint(
  id: string,
  input: Partial<BoxPrintInput>
): Promise<ApiResponse<BoxPrint>> {
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
      message: data.message || "Box print updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update box print",
    };
  }
}

export async function deleteBoxPrint(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Box print deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete box print",
    };
  }
}