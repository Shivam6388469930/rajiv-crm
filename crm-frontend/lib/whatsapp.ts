// lib/whatsapp.ts

export interface WhatsAppOrderDetails {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    color?: string;
    quality?: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress?: string;
}

export interface WhatsAppBillDetails {
  invoiceNumber: string;
  customerName: string;
  total: number;
  due: number;
  paid: number;
  dueDate?: string;
}

export function getAdminWhatsAppNumber(): string {
  // Configured admin whatsapp number or fallback
  const rawNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    "919876543210";
  // Strip non-digits
  return rawNumber.replace(/\D/g, "");
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function formatOrderWhatsAppMessage(order: WhatsAppOrderDetails): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*` +
        (item.color ? `\n   - Color: ${item.color}` : "") +
        (item.quality ? `\n   - Quality: ${item.quality}` : "") +
        `\n   - Qty: ${item.quantity} x $${item.price.toFixed(2)} = $${(
          item.quantity * item.price
        ).toFixed(2)}`
    )
    .join("\n\n");

  return (
    `🛍️ *NEW ORDER PLACED*\n` +
    `---------------------------\n` +
    `*Order #:* ${order.orderNumber}\n` +
    `*Customer:* ${order.customerName}\n` +
    (order.customerPhone ? `*Phone:* ${order.customerPhone}\n` : "") +
    (order.shippingAddress ? `*Shipping Address:* ${order.shippingAddress}\n` : "") +
    `---------------------------\n` +
    `*ITEMS ORDERED:*\n` +
    `${itemsText}\n` +
    `---------------------------\n` +
    `💰 *TOTAL AMOUNT:* $${order.total.toFixed(2)}\n\n` +
    `Please confirm the order details. Thank you!`
  );
}

export function formatBillWhatsAppMessage(bill: WhatsAppBillDetails): string {
  return (
    `📄 *INVOICE / BILL DETAILS*\n` +
    `---------------------------\n` +
    `*Invoice #:* ${bill.invoiceNumber}\n` +
    `*Customer:* ${bill.customerName}\n` +
    `*Total Billed:* $${bill.total.toFixed(2)}\n` +
    `*Amount Paid:* $${bill.paid.toFixed(2)}\n` +
    `*Balance Due:* $${bill.due.toFixed(2)}\n` +
    (bill.dueDate ? `*Due Date:* ${new Date(bill.dueDate).toLocaleDateString()}\n` : "") +
    `---------------------------\n` +
    `Please let us know if you need any assistance with this invoice.`
  );
}

export function formatProductInquiryWhatsAppMessage(
  productName: string,
  sku: string,
  color?: string,
  quality?: string,
  price?: number
): string {
  return (
    `👋 Hello Admin,\n\n` +
    `I am interested in buying this product:\n` +
    `*Product:* ${productName}\n` +
    `*SKU:* ${sku}\n` +
    (color ? `*Color:* ${color}\n` : "") +
    (quality ? `*Quality Grade:* ${quality}\n` : "") +
    (price ? `*Price:* $${price.toFixed(2)}\n` : "") +
    `\nPlease share availability and delivery options.`
  );
}

export async function sendWhatsAppApiMessage(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    // API credentials not configured, fallback link is used
    return {
      success: true,
      error: "WhatsApp Cloud API credentials not set. Used direct link mode.",
    };
  }

  try {
    const cleanPhone = recipientPhone.replace(/\D/g, "");
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: messageText },
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, messageId: data?.messages?.[0]?.id };
    }
    return { success: false, error: data?.error?.message || "Failed to send WhatsApp message" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
