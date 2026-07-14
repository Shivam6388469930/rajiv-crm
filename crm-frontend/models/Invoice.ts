// models/Invoice.ts
import { Schema, model, models } from "mongoose";

// Sub-schema for each line item on the invoice
const invoiceItemSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Sub-schema for recorded payments
const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cheque", "online"],
      default: "cash",
    },
    reference: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const invoiceSchema = new Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Customer reference — stores ObjectId but also snapshot fields
    // so the invoice stays readable even if the customer is later deleted
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    due_date: {
      type: Date,
      required: true,
    },

    // Line items
    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: "Invoice must have at least one item",
      },
    },

    // Discount applied to the whole invoice
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discount_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Calculated discount amount (stored for display)
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Tax applied to the whole invoice
    tax_type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    tax_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Calculated tax amount (stored for display)
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Calculated totals (stored to avoid recomputation on every read)
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment tracking
    paid: {
      type: Number,
      default: 0,
      min: 0,
    },
    due: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Recorded payment entries
    payments: {
      type: [paymentSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "unpaid", "partial", "paid", "completed", "cancelled"],
      default: "unpaid",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    terms: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup and search
invoiceSchema.index({ invoice_number: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ date: -1 });

export default models.Invoice || model("Invoice", invoiceSchema);
