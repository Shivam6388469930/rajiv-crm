import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getBrand,
  updateBrand,
  deleteBrand,
} from "@/services/brand.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const brand = await getBrand(id);

    return success(
      "Brand fetched",
      brand
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const brand = await updateBrand(
      id,
      body
    );

    return success(
      "Brand updated",
      brand
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    await deleteBrand(id);

    return success("Brand deleted");
  } catch (err: any) {
    return error(err.message);
  }
}