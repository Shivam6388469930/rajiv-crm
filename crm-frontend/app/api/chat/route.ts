// app/api/chat/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import { success, error } from "@/utils/sendResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const customerId = searchParams.get("customerId");
    const since = searchParams.get("since");
    const listConversations = searchParams.get("conversations") === "true";

    // Admin view: list all customer conversations summarized
    if (listConversations) {
      const allMsgs = await ChatMessage.find()
        .sort({ createdAt: -1 })
        .limit(300)
        .lean();

      const convMap = new Map<string, any>();
      for (const msg of allMsgs) {
        if (!convMap.has(msg.customerId)) {
          convMap.set(msg.customerId, {
            customerId: msg.customerId,
            senderName: msg.senderName || "Customer",
            customerPhone: msg.customerPhone || msg.customerId,
            customerEmail: msg.customerEmail || "",
            lastMessage: msg.message,
            lastAt: msg.createdAt,
            unreadCount: !msg.read && msg.sender === "customer" ? 1 : 0,
          });
        } else if (!msg.read && msg.sender === "customer") {
          convMap.get(msg.customerId).unreadCount += 1;
        }
      }

      return success("Conversations fetched", Array.from(convMap.values()));
    }

    const query: any = {};
    if (customerId) {
      query.customerId = customerId;
    }
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(150)
      .lean();

    return success("Messages fetched successfully", messages);
  } catch (err: any) {
    return error(err.message || "Failed to fetch chat messages", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.message || !body.message.trim()) {
      return error("Message content is required", 400);
    }

    if (!body.customerId) {
      return error("Customer identifier is required", 400);
    }

    const isCustomer = body.sender !== "admin";

    const chatMsg = new ChatMessage({
      sender: isCustomer ? "customer" : "admin",
      senderName: body.senderName || (isCustomer ? "Customer" : "Support Team"),
      customerId: body.customerId,
      customerPhone: body.customerPhone || "",
      customerEmail: body.customerEmail || "",
      message: body.message.trim(),
      productReference: body.productReference || null,
      read: false,
    });

    await chatMsg.save();

    return success("Message sent successfully", chatMsg, 201);
  } catch (err: any) {
    return error(err.message || "Failed to send message", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return error("Customer ID is required", 400);
    }

    await ChatMessage.updateMany(
      { customerId, read: false },
      { $set: { read: true } }
    );

    return success("Messages marked as read");
  } catch (err: any) {
    return error(err.message || "Failed to update read status", 500);
  }
}
