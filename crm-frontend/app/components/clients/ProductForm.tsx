// components/admin/products/ProductForm.tsx
"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Category, Subcategory } from "@/app/types/product.types";
import { getCategories } from "@/app/services/category.service";
import { getBrands } from "@/app/services/brand.service";
import { getSuppliers } from "@/app/services/supplier.service";
import { getFrameShapes } from "@/app/services/frameShape.service";
import { getLensTypes } from "@/app/services/lensType.service";
import { getLensIndices } from "@/app/services/lensIndex.service";
import { getBoxMaterials } from "@/app/services/boxMaterial.service";
import { getBoxPrints } from "@/app/services/boxPrint.service";
import { createProduct, updateProduct } from "@/app/services/product.service"; // ADD THIS IMPORT

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess?: () => void;
}

// Dynamic field configurations by category
const CATEGORY_FIELDS: Record<string, any[]> = {
  frame: [
    { name: "model", label: "Model", type: "text", required: true },
    { name: "color", label: "Color", type: "text" },
    { name: "size", label: "Size", type: "text" },
    { name: "shape", label: "Shape", type: "select", endpoint: "frameShapes" },
    { name: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Kids"] },
    { name: "rack_location", label: "Rack Location", type: "text" },
    { name: "gst", label: "GST", type: "select", options: ["0%", "5%", "12%", "18%", "28%"] },
  ],
  lens: [
    { name: "lens_type", label: "Lens Type", type: "select", endpoint: "lensTypes" },
    { name: "index", label: "Index", type: "select", endpoint: "lensIndices" },
    { name: "power_range", label: "Power Range", type: "text" },
    { name: "diameter", label: "Diameter", type: "text" },
    { name: "gst", label: "GST", type: "select", options: ["0%", "5%", "12%", "18%", "28%"] },
  ],
  contact_lens: [
    { name: "duration", label: "Duration", type: "select", options: ["Daily", "Weekly", "Monthly", "Yearly"] },
    { name: "power", label: "Power", type: "text", required: true },
    { name: "bc", label: "BC (Base Curve)", type: "text", required: true },
    { name: "dia", label: "DIA", type: "text", required: true },
    { name: "cylinder", label: "Cylinder", type: "text" },
    { name: "axis", label: "Axis", type: "text" },
    { name: "color", label: "Color", type: "text" },
    { name: "box_quantity", label: "Box Quantity", type: "number", required: true },
    { name: "expiry_date", label: "Expiry Date", type: "date", required: true },
    { name: "batch_number", label: "Batch Number", type: "text", required: true },
    { name: "gst", label: "GST", type: "select", options: ["0%", "5%", "12%", "18%", "28%"] },
  ],
  cover: [
    { name: "item_name", label: "Item Name", type: "text", required: true },
    { name: "box_type", label: "Box Type", type: "select", endpoint: "boxPrints" },
    { name: "material", label: "Material", type: "select", endpoint: "boxMaterials" },
    { name: "color", label: "Color", type: "text" },
    { name: "brand_logo", label: "Brand Logo", type: "text" },
    { name: "printing_type", label: "Printing Type", type: "select", endpoint: "boxPrints" },
    { name: "size", label: "Size", type: "text" },
    { name: "gst", label: "GST", type: "select", options: ["0%", "5%", "12%", "18%", "28%"] },
  ],
  accessory: [
    { name: "item_name", label: "Item Name", type: "text", required: true },
    { name: "unit", label: "Unit", type: "select", options: ["Piece", "Box", "Pack", "Set", "Pair"] },
    { name: "wholesale_price", label: "Wholesale Price", type: "number" },
    { name: "gst", label: "GST", type: "select", options: ["0%", "5%", "12%", "18%", "28%"] },
  ],
  machine: [
    { name: "asset_code", label: "Asset Code", type: "text", required: true },
    { name: "machine_name", label: "Machine Name", type: "text", required: true },
    { name: "model", label: "Model", type: "text", required: true },
    { name: "serial_number", label: "Serial Number", type: "text", required: true },
    { name: "purchase_date", label: "Purchase Date", type: "date", required: true },
    { name: "warranty_expiry", label: "Warranty Expiry", type: "date" },
    { name: "amc_expiry", label: "AMC Expiry", type: "date" },
    { name: "last_service_date", label: "Last Service Date", type: "date" },
    { name: "next_service_date", label: "Next Service Date", type: "date" },
    { name: "machine_status", label: "Machine Status", type: "select", options: ["Active", "Maintenance", "Out of Service", "Retired"] },
    { name: "assigned_branch", label: "Assigned Branch", type: "text" },
    { name: "assigned_employee", label: "Assigned Employee", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ],
};

// Subcategory mapping for each category - for static subcategories
const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  frame: ["Full Rim", "Semi Rimless", "Rimless", "Aviator", "Cat Eye", "Round", "Square", "Rectangle", "Oval"],
  lens: ["Single Vision", "Bifocal", "Progressive", "Photochromic", "Polarized", "Blue Light", "Anti-Reflective"],
  contact_lens: ["Spherical", "Toric", "Multifocal", "Color", "Silicone Hydrogel", "Daily", "Monthly", "Yearly"],
  cover: ["Lens Cover", "Spectacle Box", "Carry Bag", "Microfiber Cloth", "Warranty Card", "Invoice Cover", "Branding Sticker"],
  accessory: ["Cleaning Cloth", "Cleaning Spray", "Lens Cleaner", "Screw Set", "Nose Pad", "Temple Tip", "Chain", "Case", "Screw Driver", "Toolkit", "Lens Solution"],
  machine: ["Lensmeter", "Edger", "Tinter", "Coating Machine", "UV Machine", "Polisher", "Grinder"],
};

export default function ProductForm({ isOpen, onClose, product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [frameShapes, setFrameShapes] = useState<any[]>([]);
  const [lensTypes, setLensTypes] = useState<any[]>([]);
  const [lensIndices, setLensIndices] = useState<any[]>([]);
  const [boxMaterials, setBoxMaterials] = useState<any[]>([]);
  const [boxPrints, setBoxPrints] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load master data
  useEffect(() => {
    if (isOpen) {
      loadMasterData();
      if (product) {
        setSelectedCategory(product.category?._id || product.category);
        setSelectedSubcategory(product.subcategory?._id || product.subcategory);
        setFormData(product);
      } else {
        setSelectedCategory("");
        setSelectedSubcategory("");
        setFormData({});
      }
    }
  }, [isOpen, product]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesRes = await getCategories();
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      // Load brands
      const brandsRes = await getBrands();
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
      }

      // Load suppliers
      const suppliersRes = await getSuppliers();
      if (suppliersRes.success && suppliersRes.data) {
        setSuppliers(suppliersRes.data);
      }

      // Load frame shapes
      const shapesRes = await getFrameShapes();
      if (shapesRes.success && shapesRes.data) {
        setFrameShapes(shapesRes.data);
      }

      // Load lens types
      const lensTypesRes = await getLensTypes();
      if (lensTypesRes.success && lensTypesRes.data) {
        setLensTypes(lensTypesRes.data);
      }

      // Load lens indices
      const indicesRes = await getLensIndices();
      if (indicesRes.success && indicesRes.data) {
        setLensIndices(indicesRes.data);
      }

      // Load box materials
      const materialsRes = await getBoxMaterials();
      if (materialsRes.success && materialsRes.data) {
        setBoxMaterials(materialsRes.data);
      }

      // Load box prints
      const printsRes = await getBoxPrints();
      if (printsRes.success && printsRes.data) {
        setBoxPrints(printsRes.data);
      }
    } catch (error) {
      console.error("Error loading master data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory("");
      return;
    }

    const category = categories.find(c => c._id === selectedCategory);
    
    // If category has subcategories array, use it
    if (category?.subcategories && category.subcategories.length > 0) {
      setSubcategories(category.subcategories);
    } else {
      // Fallback to static subcategories
      const categorySlug = category?.slug || category?.name?.toLowerCase() || "";
      const staticSubs = CATEGORY_SUBCATEGORIES[categorySlug] || [];
      // Convert static subcategories to the format expected by the component
      const formattedSubs = staticSubs.map((name, index) => ({
        _id: `static-${index}`,
        name,
        categoryId: selectedCategory,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setSubcategories(formattedSubs);
    }
    
    setSelectedSubcategory("");
  }, [selectedCategory, categories]);

  // Get field configs for selected category
  const getFieldConfigs = () => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c._id === selectedCategory);
    if (!category) return [];
    return CATEGORY_FIELDS[category.slug] || CATEGORY_FIELDS[category.name.toLowerCase()] || [];
  };

  // Get select options based on field config
  const getSelectOptions = (field: any) => {
    if (field.options) return field.options.map(opt => ({ value: opt, label: opt }));
    if (field.endpoint) {
      switch (field.endpoint) {
        case "frameShapes": return frameShapes.map((s: any) => ({ value: s._id, label: s.name }));
        case "lensTypes": return lensTypes.map((l: any) => ({ value: l._id, label: l.name }));
        case "lensIndices": return lensIndices.map((l: any) => ({ value: l._id, label: l.label }));
        case "boxMaterials": return boxMaterials.map((m: any) => ({ value: m._id, label: m.name }));
        case "boxPrints": return boxPrints.map((p: any) => ({ value: p._id, label: p.printName }));
        default: return [];
      }
    }
    return [];
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};
    const commonFields = ["name", "sku", "brand", "supplier", "selling_price", "purchase_price", "stock"];
    
    // Add category and subcategory validation
    if (!selectedCategory) {
      newErrors.category = "Category is required";
    }
    if (!selectedSubcategory) {
      newErrors.subcategory = "Subcategory is required";
    }

    commonFields.forEach(field => {
      if (!formData[field] && formData[field] !== 0) {
        const label = field.replace('_', ' ').toUpperCase();
        newErrors[field] = `${label} is required`;
      }
    });

    const fieldConfigs = getFieldConfigs();
    fieldConfigs.forEach((field: any) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || "",
        category: selectedCategory,
        subcategory: selectedSubcategory,
        brand: formData.brand,
        supplier: formData.supplier,
        selling_price: parseFloat(formData.selling_price) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        stock: parseInt(formData.stock) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0,
        status: formData.status || "active",
        description: formData.description || "",
        // Category-specific fields
        ...fieldConfigs.reduce((acc: any, field: any) => {
          if (formData[field.name] !== undefined && formData[field.name] !== "") {
            acc[field.name] = formData[field.name];
          }
          return acc;
        }, {})
      };

      const response = product
        ? await updateProduct(product._id, payload)
        : await createProduct(payload);

      if (response.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrors({ submit: response.message || "Failed to save product" });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldConfigs = getFieldConfigs();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-gray-500">Enter product details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku || ""}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.sku ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                value={formData.barcode || ""}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.category ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedSubcategory(value);
                  handleInputChange("subcategory", value);
                }}
                disabled={!selectedCategory}
                className={`w-full px-3 py-2 border ${errors.subcategory ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subcategory && <p className="mt-1 text-xs text-red-500">{errors.subcategory}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand || ""}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.brand ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier || ""}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.supplier ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
              {errors.supplier && <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price || ""}
                onChange={(e) => handleInputChange("selling_price", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.selling_price ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.selling_price && <p className="mt-1 text-xs text-red-500">{errors.selling_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_price || ""}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.purchase_price ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.purchase_price && <p className="mt-1 text-xs text-red-500">{errors.purchase_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock || ""}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.stock ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock
              </label>
              <input
                type="number"
                value={formData.minimum_stock || ""}
                onChange={(e) => handleInputChange("minimum_stock", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Category-Specific Fields */}
          {selectedCategory && fieldConfigs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Category-Specific Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldConfigs.map((field: any) => {
                  const options = getSelectOptions(field);
                  const value = formData[field.name] || "";

                  if (field.type === "select") {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={value}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className={`w-full px-3 py-2 border ${errors[field.name] ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                        >
                          <option value="">Select {field.label}</option>
                          {options.map((opt: any) => (
                            <option key={opt.value || opt} value={opt.value || opt}>
                              {opt.label || opt}
                            </option>
                          ))}
                        </select>
                        {errors[field.name] && <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>}
                      </div>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <div key={field.name} className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          value={value}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 border ${errors[field.name] ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none`}
                        />
                        {errors[field.name] && <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type || "text"}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={`w-full px-3 py-2 border ${errors[field.name] ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                      />
                      {errors[field.name] && <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}