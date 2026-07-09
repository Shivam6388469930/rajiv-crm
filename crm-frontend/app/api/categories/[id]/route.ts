import { NextRequest } from "next/server";

import connectDB from "@/lib/db";
import Category from "@/models/Category";

import {
    getCategory,
    updateCategory,
    deleteCategory,
} from "@/services/category.service";

import { success, error } from "@/utils/sendResponse";

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    }
) {

    await connectDB();

    const { id } = await params;

    const category =
        await getCategory(id);

    return success(
        "Category",
        category
    );

}



export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const category = await Category.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    return success("Updated", category);
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

    await connectDB();

    const { id } = await params;

    await deleteCategory(id);

    return success(
        "Deleted"
    );

}