// validation/product.validation.ts
export function validateProduct(data: any) {
  if (!data.name || data.name.trim().length === 0) {
    return "Product name is required";
  }

  if (!data.category) {
    return "Category is required";
  }

  if (!data.subcategory) {
    return "Subcategory is required";
  }

  if (!data.sku || data.sku.trim().length === 0) {
    return "SKU is required";
  }

  if (!data.brand) {
    return "Brand is required";
  }

  if (!data.supplier) {
    return "Supplier is required";
  }

  if (data.selling_price === undefined || data.selling_price < 0) {
    return "Selling price must be greater than or equal to 0";
  }

  if (data.purchase_price === undefined || data.purchase_price < 0) {
    return "Purchase price must be greater than or equal to 0";
  }

  if (data.stock === undefined || data.stock < 0) {
    return "Stock must be greater than or equal to 0";
  }

  if (data.status && !["active", "inactive", "out_of_stock"].includes(data.status)) {
    return "Status must be 'active', 'inactive', or 'out_of_stock'";
  }

  return null;
}