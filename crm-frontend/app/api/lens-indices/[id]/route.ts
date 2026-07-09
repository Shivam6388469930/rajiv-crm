// app/api/lens-indices/[id]/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getLensIndex,
  updateLensIndex,
  deleteLensIndex,
} from "@/services/lensIndex.service";

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

    const data = await getLensIndex(id);

    if (!data) {
      return error(
        "Lens index not found",
        404
      );
    }

    return success(
      "Lens index fetched successfully",
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

    const data = await updateLensIndex(id, body);

    if (!data) {
      return error(
        "Lens index not found",
        404
      );
    }

    return success(
      "Lens index updated successfully",
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

    const data = await deleteLensIndex(id);

    if (!data) {
      return error(
        "Lens index not found",
        404
      );
    }

    return success(
      "Lens index deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}