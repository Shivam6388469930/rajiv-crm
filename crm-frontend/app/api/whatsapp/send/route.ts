// app/api/whatsapp/send/route.ts
import { NextRequest } from "next/server";
import {
  generateWhatsAppLink,
  getAdminWhatsAppNumber,
  formatOrderWhatsAppMessage,
  formatBillWhatsAppMessage,
  formatProductInquiryWhatsAppMessage,
  sendWhatsAppApiMessage,
} from "@/lib/whatsapp";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type; // "order" | "bill" | "inquiry" | "custom"
    const targetPhone = body.phone || getAdminWhatsAppNumber();

    let messageText = "";

    switch (type) {
      case "order":
        messageText = formatOrderWhatsAppMessage(body.order);
        break;
      case "bill":
        messageText = formatBillWhatsAppMessage(body.bill);
        break;
      case "inquiry":
        messageText = formatProductInquiryWhatsAppMessage(
          body.productName,
          body.sku,
          body.color,
          body.quality,
          body.price
        );
        break;
      default:
        messageText = body.text || body.message || "Hello!";
    }

    // Direct WhatsApp Web / App link for user redirection
    const link = generateWhatsAppLink(targetPhone, messageText);

    // If API mode requested, attempt Cloud API
    let apiResult: any = null;
    if (body.sendViaCloudApi) {
      apiResult = await sendWhatsAppApiMessage(targetPhone, messageText);
    }

    return success("WhatsApp message generated", {
      whatsappUrl: link,
      messageText,
      phone: targetPhone,
      apiResult,
    });
  } catch (err: any) {
    return error(err.message || "Failed to process WhatsApp request", 500);
  }
}
