// app/api/box-materials/[id]/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBoxMaterial,
  updateBoxMaterial,
  deleteBoxMaterial,
} from "@/services/boxMaterial.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const data = await getBoxMaterial(id);

    if (!data) {
      return error(
        "Box material not found",
        404
      );
    }

    return success(
      "Box material fetched successfully",
      data
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const data = await updateBoxMaterial(id, body);

    if (!data) {
      return error(
        "Box material not found",
        404
      );
    }

    return success(
      "Box material updated successfully",
      data
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const data = await deleteBoxMaterial(id);

    if (!data) {
      return error(
        "Box material not found",
        404
      );
    }

    return success(
      "Box material deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}