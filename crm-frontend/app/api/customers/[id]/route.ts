import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customer.service";

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

    const customer =
      await getCustomer(id);

    return success(
      "Customer fetched",
      customer
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

    const customer =
      await updateCustomer(
        id,
        body
      );

    return success(
      "Customer updated",
      customer
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

    await deleteCustomer(id);

    return success(
      "Customer deleted"
    );
  } catch (err: any) {
    return error(err.message);
  }
}