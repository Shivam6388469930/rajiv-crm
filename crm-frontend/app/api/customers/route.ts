import { NextRequest } from "next/server";

import connectDB from "@/lib/db";

import {
  getCustomers,
  createCustomer,
} from "@/services/customer.service";

import {
  success,
  error,
} from "@/utils/sendResponse";

import {
  validateCustomer,
} from "@/validation/customer.validation";

export async function GET() {
  try {
    await connectDB();

    const customers =
      await getCustomers();

    return success(
      "Customers fetched",
      customers
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
      validateCustomer(body);

    if (validation)
      return error(validation);

    const customer =
      await createCustomer(body);

    return success(
      "Customer created",
      customer,
      201
    );
  } catch (err: any) {
    return error(err.message);
  }
}