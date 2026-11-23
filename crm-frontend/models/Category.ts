import mongoose, { Schema, models, model } from "mongoose";

const subCategorySchema = new Schema({
  name: String,
  slug: String,
  description: String,
});

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    subcategories: [subCategorySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category =
  models.Category || model("Category", categorySchema);

export const Subcategory =
  models.Subcategory || model("Subcategory", subCategorySchema);

export default Category;