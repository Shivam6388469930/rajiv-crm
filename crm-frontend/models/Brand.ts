import { Schema, model, models } from "mongoose";

const brandSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.index({ category: 1 });
brandSchema.index({ isActive: 1 });
brandSchema.index({ brandName: 1 });

export default models.Brand || model("Brand", brandSchema);