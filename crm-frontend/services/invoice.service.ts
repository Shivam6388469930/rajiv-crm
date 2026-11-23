// services/invoice.service.ts
import Invoice from "@/models/Invoice";
import "@/models/Customer";
import "@/models/Product";
import mongoose from "mongoose";

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanInvoiceItems(items: any[]): any[] {
  return (items || []).map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);
    const discount = Math.max(0, Number(item.discount) || 0);
    const tax = Math.max(0, Number(item.tax) || 0);
    const total =
      item.total !== undefined && item.total !== null
        ? Number(item.total)
        : qty * price;

    return {
      name: item.name || "Item",
      sku: item.sku || "",
      quantity: qty,
      price,
      discount,
      tax,
      total,
      product_id:
        item.product_id && mongoose.isValidObjectId(item.product_id)
          ? item.product_id
          : null,
    };
  });
}

function computeTotals(data: any) {
  const items = cleanInvoiceItems(data.items || []);
  const subtotal: number = items.reduce(
    (sum: number, item: any) => sum + (Number(item.total) || 0),
    0
  );

  let discount = 0;
  if (data.discount_type === "percentage") {
    discount = (subtotal * (Number(data.discount_value) || 0)) / 100;
  } else {
    discount = Number(data.discount_value) || 0;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  let tax = 0;
  if (data.tax_type === "percentage") {
    tax = (taxableAmount * (Number(data.tax_value) || 0)) / 100;
  } else {
    tax = Number(data.tax_value) || 0;
  }

  const shipping = Number(data.shipping) || 0;
  const total = taxableAmount + tax + shipping;

  return { subtotal, discount, tax, total, items };
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
      query.$or = [
        { invoice_number: { $regex: filters.search, $options: "i" } },
        { "items.name": { $regex: filters.search, $options: "i" } },
      ];
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
    if (data.invoice_number) {
      const existing = await Invoice.findOne({
        invoice_number: data.invoice_number,
      });
      if (existing) throw new Error("Invoice number already exists");
    }

    // Resolve customer ID if object was passed
    const customerId =
      typeof data.customer === "object"
        ? data.customer?._id || data.customer?.id
        : data.customer;

    if (!customerId || !mongoose.isValidObjectId(customerId)) {
      throw new Error("Valid customer is required");
    }

    const { subtotal, discount, tax, total, items } = computeTotals(data);

    const invoice = new Invoice({
      ...data,
      customer: customerId,
      items,
      subtotal,
      discount,
      tax,
      total,
      paid: Number(data.paid) || 0,
      due: total - (Number(data.paid) || 0),
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

    const itemsToCompute = data.items !== undefined ? data.items : existing.items;

    // Recompute totals if items or discount/tax/shipping changed
    const { subtotal, discount, tax, total, items } = computeTotals({
      items: itemsToCompute,
      discount_type: data.discount_type ?? existing.discount_type,
      discount_value: data.discount_value ?? existing.discount_value,
      tax_type: data.tax_type ?? existing.tax_type,
      tax_value: data.tax_value ?? existing.tax_value,
      shipping: data.shipping ?? existing.shipping,
    });

    const paid = data.paid !== undefined ? Number(data.paid) : existing.paid;
    const due = Math.max(0, total - paid);

    const updatePayload: any = {
      ...data,
      items,
      subtotal,
      discount,
      tax,
      total,
      paid,
      due,
      status: deriveStatus(paid, total, data.status ?? existing.status),
    };

    if (data.customer) {
      updatePayload.customer =
        typeof data.customer === "object"
          ? data.customer._id || data.customer.id
          : data.customer;
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updatePayload,
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
