// app/api/box-materials/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBoxMaterials,
  createBoxMaterial,
} from "@/services/boxMaterial.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateBoxMaterial,
} from "@/validation/boxMaterial.validation";

export async function GET() {
  try {
    await connectDB();

    const data = await getBoxMaterials();

    return success(
      "Box materials fetched successfully",
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

    const validation = validateBoxMaterial(body);

    if (validation) {
      return error(validation);
    }

    const data = await createBoxMaterial(body);

    return success(
      "Box material created successfully",
      data,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}