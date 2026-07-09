import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBrands,
  createBrand,
} from "@/services/brand.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateBrand,
} from "@/validation/brand.validation";

export async function GET() {
  try {
    await connectDB();

    const brands = await getBrands();

    return success(
      "Brands fetched",
      brands
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    const body = await req.json();

    const validation =
      validateBrand(body);

    if (validation)
      return error(validation);

    const brand =
      await createBrand(body);

    return success(
      "Brand created",
      brand,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}