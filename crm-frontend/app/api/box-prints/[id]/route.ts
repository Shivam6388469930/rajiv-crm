// app/api/box-prints/[id]/route.ts
import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBoxPrint,
  updateBoxPrint,
  deleteBoxPrint,
} from "@/services/boxPrint.service";

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

    const data = await getBoxPrint(id);

    if (!data) {
      return error(
        "Box print not found",
        404
      );
    }

    return success(
      "Box print fetched successfully",
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

    const data = await updateBoxPrint(id, body);

    if (!data) {
      return error(
        "Box print not found",
        404
      );
    }

    return success(
      "Box print updated successfully",
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

    const data = await deleteBoxPrint(id);

    if (!data) {
      return error(
        "Box print not found",
        404
      );
    }

    return success(
      "Box print deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}