import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplier.service";

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

    const supplier =
      await getSupplier(id);

    if (!supplier) {
      return error(
        "Supplier not found",
        404
      );
    }

    return success(
      "Supplier fetched successfully",
      supplier
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

    const supplier =
      await updateSupplier(
        id,
        body
      );

    if (!supplier) {
      return error(
        "Supplier not found",
        404
      );
    }

    return success(
      "Supplier updated successfully",
      supplier
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

    const supplier =
      await deleteSupplier(id);

    if (!supplier) {
      return error(
        "Supplier not found",
        404
      );
    }

    return success(
      "Supplier deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}