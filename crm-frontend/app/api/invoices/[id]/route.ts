// app/api/invoices/[id]/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import {
  getInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoice.service";
import { success, error } from "@/utils/sendResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const invoice = await getInvoice(id);

    return success("Invoice fetched successfully", invoice);
  } catch (err: any) {
    return error(err.message, err.message === "Invoice not found" ? 404 : 400);
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

    const invoice = await updateInvoice(id, body);

    return success("Invoice updated successfully", invoice);
  } catch (err: any) {
    return error(err.message, err.message === "Invoice not found" ? 404 : 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    await deleteInvoice(id);

    return success("Invoice deleted successfully");
  } catch (err: any) {
    return error(err.message, err.message === "Invoice not found" ? 404 : 400);
  }
}
