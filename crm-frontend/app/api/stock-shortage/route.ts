// app/api/stock-shortage/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import Category from "@/models/Category";
import { success, error } from "@/utils/sendResponse";
import { generateWhatsAppLink } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const filterType = searchParams.get("filter") || "shortage"; // "shortage" | "out_of_stock" | "all"
    const search = searchParams.get("search");
    const categoryId = searchParams.get("category");

    const query: any = {};

    if (filterType === "out_of_stock") {
      query.stock = { $lte: 0 };
    } else if (filterType === "shortage") {
      query.$or = [
        { $expr: { $lte: ["$stock", "$minimum_stock"] } },
        { stock: { $lte: 10 } },
      ];
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { sku: { $regex: search.trim(), $options: "i" } },
        { barcode: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Fetch shorted products and suppliers in parallel
    const [products, suppliers, categories] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "brandName slug")
        .populate("supplier", "supplierName email phone shopLocation")
        .sort({ stock: 1, createdAt: -1 })
        .lean(),
      Supplier.find({ status: "active" }).sort({ supplierName: 1 }).lean(),
      Category.find({ isActive: true }).select("name slug").lean(),
    ]);

    // Format products with shortage deficit
    const formatted = products.map((prod: any) => {
      const minStock = prod.minimum_stock ?? 5;
      const currentStock = prod.stock ?? 0;
      const shortageUnits = Math.max(0, minStock - currentStock);
      const recommendedReorder = Math.max(15, minStock * 2 - currentStock);

      return {
        ...prod,
        shortageUnits,
        recommendedReorder,
        isOutOfStock: currentStock <= 0,
        isShortage: currentStock <= minStock,
      };
    });

    // Counts overview
    const totalOut = await Product.countDocuments({ stock: { $lte: 0 } });
    const totalShort = await Product.countDocuments({
      $or: [{ $expr: { $lte: ["$stock", "$minimum_stock"] } }, { stock: { $lte: 10 } }],
    });
    const totalAll = await Product.countDocuments();

    return success("Shortage stock fetched", {
      products: formatted,
      suppliers,
      categories,
      metrics: {
        totalShortage: totalShort,
        totalOutOfStock: totalOut,
        totalProducts: totalAll,
      },
    });
  } catch (err: any) {
    return error(err.message || "Failed to load stock shortage items", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { productId, supplierId, requiredQuantity, customNotes, variants } = body;

    if (!productId) {
      return error("Product ID is required", 400);
    }

    const product = await Product.findById(productId)
      .populate("category", "name")
      .populate("brand", "brandName")
      .populate("supplier");

    if (!product) {
      return error("Product not found", 404);
    }

    // If new supplier provided, update product's assigned supplier
    let supplierObj = product.supplier;
    if (supplierId && supplierId !== product.supplier?._id?.toString()) {
      const newSupplier = await Supplier.findById(supplierId);
      if (newSupplier) {
        product.supplier = newSupplier._id;
        await product.save();
        supplierObj = newSupplier;
      }
    }

    const qty = requiredQuantity || 25;
    const suppPhone = supplierObj?.phone || "";
    const suppName = supplierObj?.supplierName || "Supplier";
    const brandName = product.brand?.brandName || "Standard";
    const catName = product.category?.name || "Optical Product";

    // Format professional WhatsApp purchase order note
    let message = `*URGENT STOCK REQUIREMENT / PURCHASE ORDER*\n`;
    message += `To: ${suppName}\n`;
    message += `Date: ${new Date().toLocaleDateString("en-IN")}\n\n`;
    message += `Dear ${suppName},\n`;
    message += `We have a stock shortage and need immediate replenishment for the following item:\n\n`;
    message += `📦 *Product:* ${product.name}\n`;
    message += `🏷️ *SKU:* ${product.sku}\n`;
    message += `📁 *Category:* ${catName} | *Brand:* ${brandName}\n`;
    message += `🔢 *Current Stock:* ${product.stock} pcs (Low Stock Alert)\n`;
    message += `📥 *Required Quantity:* ${qty} pcs\n`;

    if (Array.isArray(variants) && variants.length > 0) {
      message += `\n*Color/Quality Variants Breakdown:*\n`;
      variants.forEach((v: any) => {
        if (v.qty > 0) {
          message += `• ${v.color} (${v.quality || "Standard"}): ${v.qty} pcs\n`;
        }
      });
    }

    if (customNotes) {
      message += `\n📝 *Notes:* ${customNotes}\n`;
    }

    message += `\nPlease confirm availability, pricing, and estimated dispatch time.\nThank you!`;

    const whatsAppUrl = suppPhone
      ? generateWhatsAppLink(suppPhone, message)
      : generateWhatsAppLink("919876543210", message);

    return success("Purchase order requirement created", {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
      },
      supplier: supplierObj,
      requiredQuantity: qty,
      message,
      whatsAppUrl,
    });
  } catch (err: any) {
    return error(err.message || "Failed to process stock requirement", 500);
  }
}
