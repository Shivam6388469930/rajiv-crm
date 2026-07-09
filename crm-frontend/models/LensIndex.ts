// models/LensIndex.ts
import { Schema, model, models } from "mongoose";

const lensIndexSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
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

export default models.LensIndex || model("LensIndex", lensIndexSchema);