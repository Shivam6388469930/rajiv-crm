// // app/api/products/route.ts
// import { NextRequest } from "next/server";
// import connectDB from "@/lib/db";
// import {
//   getProducts,
//   createProduct,
// } from "@/services/product.service";
// import {
//   success,
//   error,
// } from "@/utils/sendResponse";
// import {
//   validateProduct,
// } from "@/validation/product.validation";

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const searchParams = req.nextUrl.searchParams;
//     const filters = {
//       category: searchParams.get("category") || undefined,
//       subcategory: searchParams.get("subcategory") || undefined,
//       brand: searchParams.get("brand") || undefined,
//       supplier: searchParams.get("supplier") || undefined,
//       status: searchParams.get("status") || undefined,
//       search: searchParams.get("search") || undefined,
//     };

//     const data = await getProducts(filters);

//     return success(
//       "Products fetched successfully",
//       data
//     );
//   } catch (err: any) {
//     return error(err.message);
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const body = await req.json();

//     const validation = validateProduct(body);

//     if (validation) {
//       return error(validation);
//     }

//     const data = await createProduct(body);

//     return success(
//       "Product created successfully",
//       data,
//       201
//     );
//   } catch (err: any) {
//     return error(err.message);
//   }
// }


// app/api/products/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import {
  getProducts,
  createProduct,
} from "@/services/product.service";
import {
  success,
  error,
} from "@/utils/sendResponse";
import {
  validateProduct,
} from "@/validation/product.validation";

const OBJECT_ID_FIELDS = ["category", "subcategory", "brand", "supplier"] as const;

// Returns an error message if any reference field is missing or not a valid ObjectId
function validateObjectIds(body: Record<string, any>): string | null {
  for (const field of OBJECT_ID_FIELDS) {
    const value = body?.[field];
    if (!value || typeof value !== "string" || !mongoose.isValidObjectId(value)) {
      return `Invalid ${field} id`;
    }
  }
  return null;
}

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

    const validation = validateProduct(body);

    if (validation) {
      return error(validation);
    }

    // Clear message instead of a Mongoose CastError
    const idError = validateObjectIds(body);

    if (idError) {
      return error(idError);
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