// app/api/invoices/generate-number/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { generateInvoiceNumber } from "@/services/invoice.service";
import { success, error } from "@/utils/sendResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const invoice_number = await generateInvoiceNumber();
    return success("Invoice number generated", { invoice_number });
  } catch (err: any) {
    return error(err.message);
  }
}
