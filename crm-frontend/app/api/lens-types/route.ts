// app/api/lens-types/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getLensTypes,
  createLensType,
} from "@/services/lensType.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateLensType,
} from "@/validation/lensType.validation";

export async function GET() {
  try {
    await connectDB();

    const data = await getLensTypes();

    return success(
      "Lens types fetched successfully",
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

    const validation = validateLensType(body);

    if (validation) {
      return error(validation);
    }

    const data = await createLensType(body);

    return success(
      "Lens type created successfully",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}