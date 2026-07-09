// app/types/product.types.ts
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  _id: string;
  brandName: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier {
  _id: string;
  supplierName: string;
  email: string;
  phone: string;
  supplyProduct: string;
  shopLocation: string;
  status: "active" | "inactive";
}

export interface FrameShape {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface LensType {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface LensIndex {
  _id: string;
  value: string;
  label: string;
  status: "active" | "inactive";
}

export interface BoxMaterial {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface BoxPrint {
  _id: string;
  printName: string;
  status: "active" | "inactive";
}