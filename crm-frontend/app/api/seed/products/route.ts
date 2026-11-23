// app/api/seed/products/route.ts
import { NextRequest } from "next/server";
import { seedProductsPerCategory } from "@/lib/seedProducts";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    const report = await seedProductsPerCategory();
    return success("Optical products seeded successfully (5 per category/subcategory)", report);
  } catch (err: any) {
    return error(err.message || "Failed to seed optical products", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const report = await seedProductsPerCategory();
    return success("Optical products seeded successfully (5 per category/subcategory)", report);
  } catch (err: any) {
    return error(err.message || "Failed to seed optical products", 500);
  }
}
