// models/Product.ts
import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    // Common fields for all products
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    selling_price: {
      type: Number,
      required: true,
      min: 0,
    },
    purchase_price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimum_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    description: {
      type: String,
      trim: true,
    },

    // Category-specific fields (stored as JSON)
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    // Images
    images: [{
      url: String,
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false,
      },
    }],

    // Color-wise quality and quantity variants
    colorVariants: [
      {
        color: { type: String, required: true },
        quality: { type: String, default: "Standard" },
        quantity: { type: Number, required: true, default: 0, min: 0 },
        sku: { type: String, trim: true },
        imageUrl: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: "text", sku: "text", barcode: "text" });

export default models.Product || model("Product", productSchema);