// app/api/settings/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import { success, error } from "@/utils/sendResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create({
        companyName: "OpticCRM Solutions",
        email: "contact@opticcrm.com",
        phone: "+91 9876543210",
        gstin: "27AABCO1234F1Z5",
        address: "101 Optical Avenue, Eyecare Hub",
        city: "Mumbai",
        pincode: "400001",
        website: "https://opticcrm.com",
        currencySymbol: "₹",
        defaultGstPercent: 12,
        invoicePrefix: "INV",
        invoiceFooterNotes:
          "Thank you for choosing OpticCRM. All frames and lenses include a 1-year manufacturer warranty.",
        termsAndConditions:
          "1. Goods once sold can be returned or exchanged within 7 days with original receipt.\n2. Customized power lenses cannot be cancelled once processed in the laboratory.",
        whatsappNumber: "919876543210",
        notifyOnNewOrder: true,
        sendWhatsAppOrderAlert: true,
        sendWhatsAppBillAlert: true,
      });
    }

    return success("Settings fetched successfully", setting);
  } catch (err: any) {
    return error(err.message || "Failed to fetch settings", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create(body);
    } else {
      Object.assign(setting, body);
      await setting.save();
    }

    return success("Settings updated successfully", setting);
  } catch (err: any) {
    return error(err.message || "Failed to update settings", 500);
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
