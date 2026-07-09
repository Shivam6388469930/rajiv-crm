// models/BoxPrint.ts
import { Schema, model, models } from "mongoose";

const boxPrintSchema = new Schema(
  {
    printName: {
      type: String,
      required: true,
      trim: true,
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

export default models.BoxPrint || model("BoxPrint", boxPrintSchema);