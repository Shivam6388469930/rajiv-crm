// app/api/invoices/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import {
  getInvoices,
  createInvoice,
  generateInvoiceNumber,
} from "@/services/invoice.service";
import { success, error } from "@/utils/sendResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      status: searchParams.get("status") || undefined,
      customer: searchParams.get("customer") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const invoices = await getInvoices(filters);

    return success("Invoices fetched successfully", invoices);
  } catch (err: any) {
    return error(err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.customer) {
      return error("Customer is required");
    }
    if (!body.items || body.items.length === 0) {
      return error("At least one item is required");
    }
    if (!body.due_date) {
      return error("Due date is required");
    }

    // Auto-generate invoice number if not provided
    if (!body.invoice_number) {
      body.invoice_number = await generateInvoiceNumber();
    }

    const invoice = await createInvoice(body);

    return success("Invoice created successfully", invoice, 201);
  } catch (err: any) {
    return error(err.message);
  }
}
