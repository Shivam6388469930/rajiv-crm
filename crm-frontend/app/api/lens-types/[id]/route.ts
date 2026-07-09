// app/api/lens-types/[id]/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getLensType,
  updateLensType,
  deleteLensType,
} from "@/services/lensType.service";

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

    const data = await getLensType(id);

    if (!data) {
      return error(
        "Lens type not found",
        404
      );
    }

    return success(
      "Lens type fetched successfully",
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

    const data = await updateLensType(
      id,
      body
    );

    if (!data) {
      return error(
        "Lens type not found",
        404
      );
    }

    return success(
      "Lens type updated successfully",
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

    const data = await deleteLensType(id);

    if (!data) {
      return error(
        "Lens type not found",
        404
      );
    }

    return success(
      "Lens type deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}