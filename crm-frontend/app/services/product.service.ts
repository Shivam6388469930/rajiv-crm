// app/services/product.service.ts
export interface Product {
  _id: string;
  name: string;
  category: string | any;
  subcategory: string | any;
  sku: string;
  barcode: string;
  brand: string | any;
  supplier: string | any;
  selling_price: number;
  purchase_price: number;
  stock: number;
  minimum_stock: number;
  status: "active" | "inactive" | "out_of_stock";
  description: string;
  attributes: Record<string, any>;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  colorVariants?: Array<{ color: string; quality: string; quantity: number; sku?: string; imageUrl?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  category: string;
  subcategory: string;
  sku: string;
  barcode?: string;
  brand: string;
  supplier: string;
  selling_price: number;
  purchase_price: number;
  stock: number;
  minimum_stock?: number;
  status: "active" | "inactive" | "out_of_stock";
  description?: string;
  attributes?: Record<string, any>;
  images?: Array<{ url: string; alt: string; isPrimary: boolean }>;
  colorVariants?: Array<{ color: string; quality: string; quantity: number; sku?: string; imageUrl?: string }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE = "/api/products";

export async function getProducts(filters?: any): Promise<ApiResponse<Product[]>> {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_BASE}?${params}` : API_BASE;
    const res = await fetch(url);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Products fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch products",
    };
  }
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Product fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch product",
    };
  }
}

export async function createProduct(
  input: ProductInput
): Promise<ApiResponse<Product>> {
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
      message: data.message || "Product created successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create product",
    };
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<ApiResponse<Product>> {
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
      message: data.message || "Product updated successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return {
      success: data.success,
      message: data.message || "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete product",
    };
  }
}