// services/product.service.ts
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Supplier from "@/models/Supplier";
import mongoose from "mongoose";

function attachSubcategory(prod: any) {
  if (!prod) return prod;
  let subcategoryObj = prod.subcategory;
  if (prod.category && Array.isArray(prod.category.subcategories)) {
    const found = prod.category.subcategories.find(
      (s: any) => s._id?.toString() === prod.subcategory?.toString()
    );
    if (found) subcategoryObj = { _id: found._id, name: found.name, slug: found.slug };
  }
  return {
    ...prod,
    subcategory: subcategoryObj,
  };
}

/**
 * Automatically resolves Category, Subcategory, Brand, and Supplier.
 * If names or slugs are provided instead of ObjectIds, matches or creates them
 * so product creation never fails with invalid ID or cast errors.
 */
export async function resolveProductReferences(data: any) {
  if (!data) return data;

  // 1. Resolve Category
  let categoryDoc: any = null;
  if (data.category) {
    if (mongoose.isValidObjectId(data.category)) {
      categoryDoc = await Category.findById(data.category);
    } else {
      categoryDoc = await Category.findOne({
        $or: [
          { name: new RegExp(`^${data.category}$`, "i") },
          { slug: String(data.category).toLowerCase().trim() },
        ],
      });
    }

    if (categoryDoc) {
      data.category = categoryDoc._id;
    }
  }

  // 2. Resolve Subcategory
  if (data.subcategory) {
    if (!mongoose.isValidObjectId(data.subcategory)) {
      if (categoryDoc && Array.isArray(categoryDoc.subcategories)) {
        const sub = categoryDoc.subcategories.find(
          (s: any) =>
            s.name?.toLowerCase() === String(data.subcategory).toLowerCase().trim() ||
            s.slug?.toLowerCase() === String(data.subcategory).toLowerCase().trim() ||
            s._id?.toString() === String(data.subcategory)
        );
        if (sub) {
          data.subcategory = sub._id;
        }
      }
    }
  }

  // 3. Resolve Brand
  if (data.brand) {
    let brandDoc: any = null;
    if (mongoose.isValidObjectId(data.brand)) {
      brandDoc = await Brand.findById(data.brand);
    } else {
      const brandStr = String(data.brand).trim();
      const brandSlug = brandStr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      brandDoc = await Brand.findOne({
        $or: [
          { brandName: new RegExp(`^${brandStr}$`, "i") },
          { slug: brandSlug },
        ],
      });

      if (!brandDoc && brandStr) {
        // Auto-create brand document linked to the category
        brandDoc = await Brand.create({
          brandName: brandStr,
          slug: brandSlug || `brand-${Date.now()}`,
          category: data.category || categoryDoc?._id,
          description: `Master brand for ${brandStr}`,
          isActive: true,
        });
      }
    }

    if (brandDoc) {
      data.brand = brandDoc._id;
    }
  }

  // 4. Resolve Supplier
  if (data.supplier) {
    let supplierDoc: any = null;
    if (mongoose.isValidObjectId(data.supplier)) {
      supplierDoc = await Supplier.findById(data.supplier);
    } else {
      const supplierStr = String(data.supplier).trim();
      supplierDoc = await Supplier.findOne({
        supplierName: new RegExp(`^${supplierStr}$`, "i"),
      });

      if (!supplierDoc && supplierStr) {
        // Auto-create supplier document
        const safeEmailPrefix = supplierStr.toLowerCase().replace(/[^a-z0-9]+/g, "");
        supplierDoc = await Supplier.create({
          supplierName: supplierStr,
          email: `${safeEmailPrefix || "supplier"}@opticalcrm.local`,
          phone: "9876543210",
          supplyProduct: categoryDoc?.name || "Optical Goods",
          status: "active",
        });
      }
    }

    if (supplierDoc) {
      data.supplier = supplierDoc._id;
    }
  }

  return data;
}

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
      const trimmed = filters.search.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { barcode: searchRegex },
      ];
    }

    const products = await Product.find(query)
      .populate("category", "name slug subcategories")
      .populate("brand", "brandName slug")
      .populate("supplier", "supplierName email phone")
      .sort({ createdAt: -1 })
      .lean();

    return (products || []).map(attachSubcategory);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getProduct(id: string) {
  try {
    const product = await Product.findById(id)
      .populate("category", "name slug subcategories")
      .populate("brand", "brandName slug")
      .populate("supplier", "supplierName email phone")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }
    return attachSubcategory(product);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createProduct(data: any) {
  try {
    // Automatically resolve names/slugs to ObjectIds
    await resolveProductReferences(data);

    // Check if SKU already exists
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      throw new Error("Product with this SKU already exists");
    }

    const product = new Product(data);
    await product.save();
    return await getProduct(product._id.toString());
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    // Automatically resolve names/slugs to ObjectIds
    await resolveProductReferences(data);

    // If updating SKU, check if new SKU already exists
    if (data.sku) {
      const existing = await Product.findOne({
        sku: data.sku,
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error("Product with this SKU already exists");
      }
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error("Product not found");
    }
    return await getProduct(id);
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
    return await getProduct(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
