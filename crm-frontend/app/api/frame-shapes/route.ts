import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getFrameShapes,
  createFrameShape,
} from "@/services/frameShape.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateFrameShape,
} from "@/validation/frameShape.validation";

export async function GET() {
  try {
    await connectDB();

    const data =
      await getFrameShapes();

    return success(
      "Frame shapes fetched",
      data
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

    const body =
      await req.json();

    const validation =
      validateFrameShape(body);

    if (validation)
      return error(validation);

    const data =
      await createFrameShape(body);

    return success(
      "Frame shape created",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}