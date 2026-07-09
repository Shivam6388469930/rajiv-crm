// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
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

    const data = await getProduct(id);

    if (!data) {
      return error(
        "Product not found",
        404
      );
    }

    return success(
      "Product fetched successfully",
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

    const data = await updateProduct(id, body);

    if (!data) {
      return error(
        "Product not found",
        404
      );
    }

    return success(
      "Product updated successfully",
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

    const data = await deleteProduct(id);

    if (!data) {
      return error(
        "Product not found",
        404
      );
    }

    return success(
      "Product deleted successfully"
    );
  } catch (err: any) {
    return error(err.message);
  }
}