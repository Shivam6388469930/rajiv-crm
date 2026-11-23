// app/api/orders/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import { success, error } from "@/utils/sendResponse";
import {
  generateWhatsAppLink,
  getAdminWhatsAppNumber,
  formatOrderWhatsAppMessage,
} from "@/lib/whatsapp";

async function generateOrderNumber(): Promise<string> {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const prefix = `ORD-${year}${month}-`;

  const latest = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  }).sort({ orderNumber: -1 });

  let seq = 1;
  if (latest) {
    const parts = latest.orderNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const customer = searchParams.get("customer");
    const customerPhone = searchParams.get("phone");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (status) query.orderStatus = status;
    if (customer) query.customer = customer;
    if (customerPhone) query["customerDetails.phone"] = customerPhone;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customerDetails.name": { $regex: search, $options: "i" } },
        { "customerDetails.phone": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate("customer", "name email phone company")
      .populate("invoice", "invoice_number total paid due status")
      .sort({ createdAt: -1 })
      .lean();

    return success("Orders fetched successfully", orders);
  } catch (err: any) {
    return error(err.message || "Failed to fetch orders");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return error("At least one item is required in the order", 400);
    }

    if (!body.customerDetails?.name || !body.customerDetails?.phone) {
      return error("Customer name and phone number are required", 400);
    }

    const orderNumber = await generateOrderNumber();

    // 1. Calculate totals
    const subtotal = body.items.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.total) || (Number(item.quantity) || 1) * (Number(item.price) || 0)),
      0
    );
    const tax = Number(body.tax) || 0;
    const shipping = Number(body.shipping) || 0;
    const total = subtotal + tax + shipping;

    // 2. Decrement stock for each product and colorVariant
    for (const item of body.items) {
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod) {
          const qty = Number(item.quantity) || 1;
          prod.stock = Math.max(0, (prod.stock || 0) - qty);

          // Update variant quantity if color variant was ordered
          if (item.color && Array.isArray(prod.colorVariants)) {
            const variant = prod.colorVariants.find(
              (v: any) => v.color?.toLowerCase() === item.color?.toLowerCase()
            );
            if (variant) {
              variant.quantity = Math.max(0, (variant.quantity || 0) - qty);
            }
          }

          if (prod.stock === 0) {
            prod.status = "out_of_stock";
          }
          await prod.save();
        }
      }
    }

    // 3. Find or link customer in DB
    let customerId = body.customer;
    if (!customerId && body.customerDetails?.phone) {
      const existingCustomer = await Customer.findOne({
        phone: body.customerDetails.phone,
      });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      }
    }

    // 4. Create linked Invoice for bill management
    const d = new Date();
    const invYear = d.getFullYear();
    const invMonth = String(d.getMonth() + 1).padStart(2, "0");
    const invPrefix = `INV-${invYear}${invMonth}-`;
    const lastInv = await Invoice.findOne({
      invoice_number: { $regex: `^${invPrefix}` },
    }).sort({ invoice_number: -1 });

    let invSeq = 1;
    if (lastInv) {
      const p = lastInv.invoice_number.split("-");
      const s = parseInt(p[p.length - 1], 10);
      if (!isNaN(s)) invSeq = s + 1;
    }
    const invoiceNumber = `${invPrefix}${String(invSeq).padStart(3, "0")}`;

    const invoiceItems = body.items.map((it: any) => ({
      product_id: it.product,
      name: `${it.name}${it.color ? ` (${it.color} - ${it.quality || "Standard"})` : ""}`,
      sku: it.sku || "",
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
      discount: 0,
      tax: 0,
      total: (Number(it.quantity) || 1) * (Number(it.price) || 0),
    }));

    let invoiceDoc: any = null;
    if (customerId) {
      invoiceDoc = new Invoice({
        invoice_number: invoiceNumber,
        customer: customerId,
        date: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: invoiceItems,
        discount_type: "percentage",
        discount_value: 0,
        tax_type: "fixed",
        tax_value: tax,
        shipping,
        subtotal,
        total,
        paid: body.paymentStatus === "paid" ? total : 0,
        due: body.paymentStatus === "paid" ? 0 : total,
        status: body.paymentStatus === "paid" ? "paid" : "unpaid",
        notes: `Auto-generated for Order #${orderNumber}`,
      });
      await invoiceDoc.save();
    }

    // 5. Create Order
    const order = new Order({
      orderNumber,
      customer: customerId || null,
      customerDetails: body.customerDetails,
      items: body.items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod: body.paymentMethod || "cash_on_delivery",
      paymentStatus: body.paymentStatus || "unpaid",
      orderStatus: "pending",
      invoice: invoiceDoc ? invoiceDoc._id : null,
      notes: body.notes || "",
    });

    await order.save();

    // 6. Build WhatsApp confirmation link
    const adminPhone = getAdminWhatsAppNumber();
    const whatsappText = formatOrderWhatsAppMessage({
      orderNumber,
      customerName: body.customerDetails.name,
      customerPhone: body.customerDetails.phone,
      items: body.items,
      total,
      shippingAddress: `${body.customerDetails.address || ""}, ${body.customerDetails.city || ""}`.trim(),
    });
    const whatsappUrl = generateWhatsAppLink(adminPhone, whatsappText);

    return success(
      "Order placed successfully",
      {
        order,
        invoice: invoiceDoc,
        whatsappUrl,
        whatsappText,
      },
      201
    );
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return error(err.message || "Failed to place order", 500);
  }
}
