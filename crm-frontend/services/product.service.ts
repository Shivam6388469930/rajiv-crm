// services/product.service.ts
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function getProducts(filters: any = {}) {
  try {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    if (filters.brand) {
      query.brand = filters.brand;
    }

    if (filters.supplier) {
      query.supplier = filters.supplier;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("brand", "brandName slug")
      .populate("supplier", "supplierName email phone")
      .sort({ createdAt: -1 });

    return products;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getProduct(id: string) {
  try {
    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("brand", "brandName slug")
      .populate("supplier", "supplierName email phone");

    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createProduct(data: any) {
  try {
    // Check if SKU already exists
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      throw new Error("Product with this SKU already exists");
    }

    const product = new Product(data);
    await product.save();
    return product;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    // If updating SKU, check if new SKU already exists
    if (data.sku) {
      const existing = await Product.findOne({
        sku: data.sku,
        _id: { $ne: id }
      });
      if (existing) {
        throw new Error("Product with this SKU already exists");
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateStock(id: string, quantity: number) {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    product.stock += quantity;
    if (product.stock < 0) {
      throw new Error("Insufficient stock");
    }

    await product.save();
    return product;
  } catch (error: any) {
    throw new Error(error.message);
  }
}