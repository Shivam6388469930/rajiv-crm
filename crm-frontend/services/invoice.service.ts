// services/invoice.service.ts
import Invoice from "@/models/Invoice";
import mongoose from "mongoose";

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeTotals(data: any) {
  const subtotal: number = (data.items || []).reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  let discount = 0;
  if (data.discount_type === "percentage") {
    discount = (subtotal * (data.discount_value || 0)) / 100;
  } else {
    discount = data.discount_value || 0;
  }

  const taxableAmount = subtotal - discount;
  let tax = 0;
  if (data.tax_type === "percentage") {
    tax = (taxableAmount * (data.tax_value || 0)) / 100;
  } else {
    tax = data.tax_value || 0;
  }

  const shipping = data.shipping || 0;
  const total = subtotal - discount + tax + shipping;

  return { subtotal, discount, tax, total };
}

function deriveStatus(paid: number, total: number, current?: string): string {
  if (current === "draft" || current === "cancelled") return current;
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}

// ─── CRUD ───────────────────────────────────────────────────────────────────

export async function getInvoices(filters: any = {}) {
  try {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.customer) query.customer = filters.customer;
    if (filters.search) {
      query.invoice_number = { $regex: filters.search, $options: "i" };
    }

    const invoices = await Invoice.find(query)
      .populate("customer", "name email company phone")
      .sort({ createdAt: -1 });

    return invoices;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getInvoice(id: string) {
  try {
    const invoice = await Invoice.findById(id).populate(
      "customer",
      "name email company phone address"
    );

    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createInvoice(data: any) {
  try {
    // Check if invoice_number already exists
    const existing = await Invoice.findOne({
      invoice_number: data.invoice_number,
    });
    if (existing) throw new Error("Invoice number already exists");

    const { subtotal, discount, tax, total } = computeTotals(data);

    const invoice = new Invoice({
      ...data,
      subtotal,
      discount,
      tax,
      total,
      paid: 0,
      due: total,
      status: data.status || "unpaid",
    });

    await invoice.save();

    // Return populated
    return await Invoice.findById(invoice._id).populate(
      "customer",
      "name email company phone"
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateInvoice(id: string, data: any) {
  try {
    const existing = await Invoice.findById(id);
    if (!existing) throw new Error("Invoice not found");

    // Recompute totals if items or discount/tax/shipping changed
    const { subtotal, discount, tax, total } = computeTotals({
      items: data.items ?? existing.items,
      discount_type: data.discount_type ?? existing.discount_type,
      discount_value: data.discount_value ?? existing.discount_value,
      tax_type: data.tax_type ?? existing.tax_type,
      tax_value: data.tax_value ?? existing.tax_value,
      shipping: data.shipping ?? existing.shipping,
    });

    const paid = existing.paid; // keep existing paid amount
    const due = Math.max(0, total - paid);

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      {
        ...data,
        subtotal,
        discount,
        tax,
        total,
        paid,
        due,
        status: deriveStatus(paid, total, data.status ?? existing.status),
      },
      { new: true, runValidators: true }
    ).populate("customer", "name email company phone");

    return invoice;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ─── Payment Recording ───────────────────────────────────────────────────────

export async function recordPayment(invoiceId: string, paymentData: any) {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Payment amount must be a positive number");
    }
    if (amount > invoice.due) {
      throw new Error(
        `Payment amount (${amount}) exceeds amount due (${invoice.due})`
      );
    }

    const newPaid = invoice.paid + amount;
    const newDue = Math.max(0, invoice.total - newPaid);

    const payment = {
      amount,
      payment_method: paymentData.payment_method || "cash",
      reference: paymentData.reference || "",
      notes: paymentData.notes || "",
      paid_at: new Date(),
    };

    const updated = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        $push: { payments: payment },
        $set: {
          paid: newPaid,
          due: newDue,
          status: deriveStatus(newPaid, invoice.total),
        },
      },
      { new: true }
    ).populate("customer", "name email company phone");

    return updated;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ─── Invoice Number Generator ─────────────────────────────────────────────────

export async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Find the latest invoice this month
  const prefix = `INV-${year}${month}-`;
  const latest = await Invoice.findOne({
    invoice_number: { $regex: `^${prefix}` },
  }).sort({ invoice_number: -1 });

  let seq = 1;
  if (latest) {
    const parts = latest.invoice_number.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}
