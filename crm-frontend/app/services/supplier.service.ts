// app/services/supplier.service.ts
export interface Supplier {
  _id: string;
  supplierName: string;
  email: string;
  phone: string;
  supplyProduct: string;
  shopLocation: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  supplierName: string;
  email: string;
  phone: string;
  supplyProduct?: string;
  shopLocation?: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/suppliers";

export async function getSuppliers(): Promise<ApiResponse<Supplier[]>> {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Suppliers fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch suppliers",
    };
  }
}

export async function getSupplier(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Supplier fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch supplier",
    };
  }
}

export async function createSupplier(
  input: SupplierInput
): Promise<ApiResponse<Supplier>> {
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
      message: data.message || "Supplier created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create supplier",
    };
  }
}

export async function updateSupplier(
  id: string,
  input: Partial<SupplierInput>
): Promise<ApiResponse<Supplier>> {
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
      message: data.message || "Supplier updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update supplier",
    };
  }
}

export async function deleteSupplier(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Supplier deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete supplier",
    };
  }
}