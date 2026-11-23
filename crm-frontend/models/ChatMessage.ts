// models/ChatMessage.ts
import { Schema, model, models } from "mongoose";

const chatMessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    productReference: {
      productId: String,
      productName: String,
      productSku: String,
      price: Number,
      imageUrl: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default models.ChatMessage || model("ChatMessage", chatMessageSchema);
