// app/api/box-prints/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBoxPrints,
  createBoxPrint,
} from "@/services/boxPrint.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateBoxPrint,
} from "@/validation/boxPrint.validation";

export async function GET() {
  try {
    await connectDB();

    const data = await getBoxPrints();

    return success(
      "Box prints fetched successfully",
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

    const validation = validateBoxPrint(body);

    if (validation) {
      return error(validation);
    }

    const data = await createBoxPrint(body);

    return success(
      "Box print created successfully",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}