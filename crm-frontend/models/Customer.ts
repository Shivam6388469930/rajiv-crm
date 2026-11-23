import { Schema, model, models } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "Clinic",
        "Optical Store",
        "Retail",
        "Wholesale",
      ],
      default: "Clinic",
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "blocked",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ status: 1 });
customerSchema.index({ type: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ createdAt: -1 });

export default models.Customer ||
  model("Customer", customerSchema);