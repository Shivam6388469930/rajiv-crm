// app/api/products/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import {
  getProducts,
  createProduct,
  resolveProductReferences,
} from "@/services/product.service";
import {
  success,
  error,
} from "@/utils/sendResponse";
import {
  validateProduct,
} from "@/validation/product.validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      brand: searchParams.get("brand") || undefined,
      supplier: searchParams.get("supplier") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const data = await getProducts(filters);

    return success(
      "Products fetched successfully",
      data
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Auto-resolve any string references or names to valid ObjectIds
    await resolveProductReferences(body);

    const validation = validateProduct(body);

    if (validation) {
      return error(validation);
    }

    const data = await createProduct(body);

    return success(
      "Product created successfully",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}
