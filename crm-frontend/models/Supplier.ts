import { Schema, model, models } from "mongoose";

const supplierSchema = new Schema(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    supplyProduct: {
      type: String,
      default: "",
    },

    shopLocation: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Supplier || model("Supplier", supplierSchema);