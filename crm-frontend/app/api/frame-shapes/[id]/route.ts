import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getFrameShape,
  updateFrameShape,
  deleteFrameShape,
} from "@/services/frameShape.service";

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

    const { id } =
      await params;

    const data =
      await getFrameShape(id);

    return success(
      "Frame shape fetched",
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

    const { id } =
      await params;

    const body =
      await req.json();

    const data =
      await updateFrameShape(
        id,
        body
      );

    return success(
      "Frame shape updated",
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

    const { id } =
      await params;

    await deleteFrameShape(id);

    return success(
      "Frame shape deleted"
    );
  } catch (err: any) {
    return error(err.message);
  }
}