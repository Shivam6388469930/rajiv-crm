// app/api/orders/[id]/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import { success, error } from "@/utils/sendResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate("customer", "name email phone company address")
      .populate("invoice")
      .populate("items.product", "name sku images selling_price");

    if (!order) {
      return error("Order not found", 404);
    }

    return success("Order fetched successfully", order);
  } catch (err: any) {
    return error(err.message || "Failed to fetch order", 500);
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

    const allowedUpdates = [
      "orderStatus",
      "paymentStatus",
      "notes",
      "customerDetails",
    ];
    const updatePayload: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    const order = await Order.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("invoice");

    if (!order) {
      return error("Order not found", 404);
    }

    // If order was marked paid, sync invoice
    if (body.paymentStatus === "paid" && order.invoice) {
      await Invoice.findByIdAndUpdate(order.invoice._id || order.invoice, {
        paid: order.total,
        due: 0,
        status: "paid",
      });
    }

    return success("Order updated successfully", order);
  } catch (err: any) {
    return error(err.message || "Failed to update order", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return error("Order not found", 404);
    }

    return success("Order deleted successfully", { id });
  } catch (err: any) {
    return error(err.message || "Failed to delete order", 500);
  }
}
