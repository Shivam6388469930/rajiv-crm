// app/api/lens-indices/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getLensIndices,
  createLensIndex,
  seedLensIndices,
} from "@/services/lensIndex.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateLensIndex,
} from "@/validation/lensIndex.validation";

import { LENS_INDICES } from "@/constants/lensIndices";

export async function GET() {
  try {
    await connectDB();

    const data = await getLensIndices();

    return success(
      "Lens indices fetched successfully",
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

    // Check if it's a seed request
    if (body.seed) {
      const data = await seedLensIndices(LENS_INDICES);
      return success(
        "Lens indices seeded successfully",
        data
      );
    }

    const validation = validateLensIndex(body);

    if (validation) {
      return error(validation);
    }

    const data = await createLensIndex(body);

    return success(
      "Lens index created successfully",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}