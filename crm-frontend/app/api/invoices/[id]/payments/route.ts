// app/api/invoices/[id]/payments/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { recordPayment } from "@/services/invoice.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (!body.amount || parseFloat(body.amount) <= 0) {
      return error("Payment amount must be greater than 0");
    }

    if (!body.payment_method) {
      return error("Payment method is required");
    }

    const invoice = await recordPayment(id, body);

    return success("Payment recorded successfully", invoice, 201);
  } catch (err: any) {
    return error(err.message, err.message === "Invoice not found" ? 404 : 400);
  }
}
