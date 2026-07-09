import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getSuppliers,
  createSupplier,
} from "@/services/supplier.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateSupplier,
} from "@/validation/supplier.validation";

export async function GET() {
  try {
    await connectDB();

    const suppliers =
      await getSuppliers();

    return success(
      "Suppliers fetched successfully",
      suppliers
    );
  } catch (err: any) {
    return error(err.message);
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const validation =
      validateSupplier(body);

    if (validation) {
      return error(validation);
    }

    const supplier =
      await createSupplier(body);

    return success(
      "Supplier created successfully",
      supplier,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}