// models/Setting.ts
import { Schema, model, models } from "mongoose";

const settingSchema = new Schema(
  {
    companyName: {
      type: String,
      default: "OpticCRM Solutions",
      trim: true,
    },
    email: {
      type: String,
      default: "contact@opticcrm.com",
      trim: true,
    },
    phone: {
      type: String,
      default: "+91 9876543210",
      trim: true,
    },
    gstin: {
      type: String,
      default: "27AABCO1234F1Z5",
      trim: true,
    },
    address: {
      type: String,
      default: "101 Optical Avenue, Eyecare Hub",
      trim: true,
    },
    city: {
      type: String,
      default: "Mumbai",
      trim: true,
    },
    pincode: {
      type: String,
      default: "400001",
      trim: true,
    },
    website: {
      type: String,
      default: "https://opticcrm.com",
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: "$",
      trim: true,
    },
    defaultGstPercent: {
      type: Number,
      default: 12,
    },
    invoicePrefix: {
      type: String,
      default: "INV",
      trim: true,
    },
    invoiceFooterNotes: {
      type: String,
      default: "Thank you for choosing OpticCRM. All frames and lenses include a 1-year manufacturer warranty.",
    },
    termsAndConditions: {
      type: String,
      default: "1. Goods once sold can be returned or exchanged within 7 days with original receipt.\n2. Customized power lenses cannot be cancelled once processed in the laboratory.",
    },
    whatsappNumber: {
      type: String,
      default: "919876543210",
      trim: true,
    },
    whatsappApiToken: {
      type: String,
      default: "",
    },
    whatsappPhoneId: {
      type: String,
      default: "",
    },
    cloudinaryCloudName: {
      type: String,
      default: "",
    },
    cloudinaryApiKey: {
      type: String,
      default: "",
    },
    notifyOnNewOrder: {
      type: Boolean,
      default: true,
    },
    sendWhatsAppOrderAlert: {
      type: Boolean,
      default: true,
    },
    sendWhatsAppBillAlert: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Setting || model("Setting", settingSchema);
