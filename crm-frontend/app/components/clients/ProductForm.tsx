// components/admin/products/ProductForm.tsx
"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { Category, Subcategory, ColorVariant } from "@/app/types/product.types";
import { getCategories } from "@/app/services/category.service";
import { getBrands } from "@/app/services/brand.service";
import { getSuppliers } from "@/app/services/supplier.service";
import { getFrameShapes } from "@/app/services/frameShape.service";
import { getLensTypes } from "@/app/services/lensType.service";
import { getLensIndices } from "@/app/services/lensIndex.service";
import { getBoxMaterials } from "@/app/services/boxMaterial.service";
import { getBoxPrints } from "@/app/services/boxPrint.service";
import { createProduct, updateProduct } from "@/app/services/product.service";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess?: () => void;
}

const toId = (val: any): string => {
  if (!val) return "";
  if (typeof val === "object") return String(val._id || val.id || "");
  return String(val);
};

const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

const CATEGORY_FIELDS: Record<string, any[]> = {
  frame: [
    { name: "model", label: "Model", type: "text", required: true },
    { name: "color", label: "Default Frame Color", type: "text" },
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

const isRefField = (field: any) => Boolean(field?.endpoint);

const QUALITY_OPTIONS = [
  "Standard",
  "Premium",
  "Grade A",
  "Grade A+",
  "Luxury",
  "Economy",
];

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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Images state
  const [images, setImages] = useState<Array<{ url: string; alt: string; isPrimary: boolean }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Color Variants (Color-wise quality and quantity)
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    loadMasterData();

    if (product) {
      setEditingProductId(product._id);
      setSelectedCategory(toId(product.category));
      setSelectedSubcategory(toId(product.subcategory));

      const attrs =
        product.attributes instanceof Map
          ? Object.fromEntries(product.attributes)
          : product.attributes || {};

      const flattenedData = {
        ...attrs,
        ...product,
        brand: toId(product.brand),
        supplier: toId(product.supplier),
      };

      ["shape", "lens_type", "index", "box_type", "material", "printing_type"].forEach((key) => {
        if (flattenedData[key] && typeof flattenedData[key] === "object") {
          flattenedData[key] = toId(flattenedData[key]);
        }
      });

      setFormData(flattenedData);
      setImages(product.images || []);
      setColorVariants(product.colorVariants || []);
    } else {
      setEditingProductId(null);
      setSelectedCategory("");
      setSelectedSubcategory("");
      setFormData({});
      setImages([]);
      setColorVariants([]);
    }
    setErrors({});
  }, [isOpen, product]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [
        categoriesRes,
        brandsRes,
        suppliersRes,
        shapesRes,
        lensTypesRes,
        indicesRes,
        materialsRes,
        printsRes,
      ] = await Promise.all([
        getCategories(),
        getBrands(),
        getSuppliers(),
        getFrameShapes(),
        getLensTypes(),
        getLensIndices(),
        getBoxMaterials(),
        getBoxPrints(),
      ]);

      if (categoriesRes?.success && categoriesRes.data) setCategories(categoriesRes.data);
      if (brandsRes?.success && brandsRes.data) setBrands(brandsRes.data);
      if (suppliersRes?.success && suppliersRes.data) setSuppliers(suppliersRes.data);
      if (shapesRes?.success && shapesRes.data) setFrameShapes(shapesRes.data);
      if (lensTypesRes?.success && lensTypesRes.data) setLensTypes(lensTypesRes.data);
      if (indicesRes?.success && indicesRes.data) setLensIndices(indicesRes.data);
      if (materialsRes?.success && materialsRes.data) setBoxMaterials(materialsRes.data);
      if (printsRes?.success && printsRes.data) setBoxPrints(printsRes.data);
    } catch (error) {
      console.error("Error loading master data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      if (!editingProductId) setSelectedSubcategory("");
      return;
    }

    const category = categories.find((c) => (c._id || (c as any).id) === selectedCategory);
    if (category?.subcategories && category.subcategories.length > 0) {
      setSubcategories(category.subcategories);
    } else {
      setSubcategories([]);
    }

    if (!editingProductId) setSelectedSubcategory("");
  }, [selectedCategory, categories, editingProductId]);

  const getFieldConfigs = () => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => (c._id || (c as any).id) === selectedCategory);
    if (!category) return [];
    return CATEGORY_FIELDS[category.slug] || CATEGORY_FIELDS[category.name.toLowerCase()] || [];
  };

  const getSelectOptions = (field: any) => {
    if (field.options) return field.options.map((opt: any) => ({ value: opt, label: opt }));
    if (field.endpoint) {
      switch (field.endpoint) {
        case "frameShapes": return frameShapes.map((s: any) => ({ value: s._id || s.id, label: s.name }));
        case "lensTypes": return lensTypes.map((l: any) => ({ value: l._id || l.id, label: l.name }));
        case "lensIndices": return lensIndices.map((l: any) => ({ value: l._id || l.id, label: l.label }));
        case "boxMaterials": return boxMaterials.map((m: any) => ({ value: m._id || m.id, label: m.name }));
        case "boxPrints": return boxPrints.map((p: any) => ({ value: p._id || p.id, label: p.printName }));
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

  // Image Upload handler (Cloudinary)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setImages((prev) => [
          ...prev,
          {
            url: json.data.url,
            alt: file.name || "Product image",
            isPrimary: prev.length === 0,
          },
        ]);
      } else {
        alert(json.message || "Failed to upload image to Cloudinary");
      }
    } catch (err: any) {
      alert("Image upload error: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Color Variants handlers
  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        color: "",
        quality: "Standard",
        quantity: 0,
        sku: "",
        imageUrl: "",
      },
    ]);
  };

  const updateColorVariant = (index: number, field: keyof ColorVariant, value: any) => {
    setColorVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // Auto update total stock if variants exist
      const totalVarQty = next.reduce((sum, v) => sum + (parseInt(String(v.quantity)) || 0), 0);
      setFormData((f) => ({ ...f, stock: totalVarQty }));

      return next;
    });
  };

  const removeColorVariant = (index: number) => {
    setColorVariants((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const totalVarQty = next.reduce((sum, v) => sum + (parseInt(String(v.quantity)) || 0), 0);
      if (next.length > 0) {
        setFormData((f) => ({ ...f, stock: totalVarQty }));
      }
      return next;
    });
  };

  const handleClose = () => {
    setEditingProductId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    const commonFields = ["name", "sku", "brand", "supplier", "selling_price", "purchase_price"];

    if (!selectedCategory) newErrors.category = "Category is required";
    if (!selectedSubcategory) newErrors.subcategory = "Subcategory is required";

    commonFields.forEach((field) => {
      if (!formData[field] && formData[field] !== 0) {
        const label = field.replace("_", " ").toUpperCase();
        newErrors[field] = `${label} is required`;
      }
    });

    let brandId = toId(formData.brand);
    if (!isValidObjectId(brandId) && brands.length > 0) {
      const matched = brands.find(
        (b) => b.brandName?.toLowerCase() === String(formData.brand).toLowerCase() ||
               b.slug?.toLowerCase() === String(formData.brand).toLowerCase()
      );
      if (matched) {
        brandId = matched._id || matched.id;
      }
    }

    let supplierId = toId(formData.supplier);
    if (!isValidObjectId(supplierId) && suppliers.length > 0) {
      const matched = suppliers.find(
        (s) => s.supplierName?.toLowerCase() === String(formData.supplier).toLowerCase()
      );
      if (matched) {
        supplierId = matched._id || matched.id;
      }
    }

    let categoryId = toId(selectedCategory);
    if (!isValidObjectId(categoryId) && categories.length > 0) {
      const matched = categories.find(
        (c) => c.name?.toLowerCase() === String(selectedCategory).toLowerCase() ||
               c.slug?.toLowerCase() === String(selectedCategory).toLowerCase()
      );
      if (matched) {
        categoryId = matched._id || (matched as any).id;
      }
    }

    let subcategoryId = toId(selectedSubcategory);
    if (!isValidObjectId(subcategoryId) && subcategories.length > 0) {
      const matched = subcategories.find(
        (s) => s.name?.toLowerCase() === String(selectedSubcategory).toLowerCase() ||
               s.slug?.toLowerCase() === String(selectedSubcategory).toLowerCase()
      );
      if (matched) {
        subcategoryId = matched._id || (matched as any).id;
      }
    }

    if (brandId && !isValidObjectId(brandId)) newErrors.brand = "Please re-select a valid brand";
    if (supplierId && !isValidObjectId(supplierId)) newErrors.supplier = "Please re-select a valid supplier";
    if (categoryId && !isValidObjectId(categoryId)) newErrors.category = "Please re-select a valid category";
    if (subcategoryId && !isValidObjectId(subcategoryId)) newErrors.subcategory = "Please re-select a valid subcategory";

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
      // Calculate total stock from variants if provided
      const totalStock =
        colorVariants.length > 0
          ? colorVariants.reduce((sum, v) => sum + (parseInt(String(v.quantity)) || 0), 0)
          : parseInt(formData.stock) || 0;

      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || "",
        category: categoryId,
        subcategory: subcategoryId,
        brand: brandId,
        supplier: supplierId,
        selling_price: parseFloat(formData.selling_price) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        stock: totalStock,
        minimum_stock: parseInt(formData.minimum_stock) || 0,
        status: totalStock === 0 ? "out_of_stock" : (formData.status || "active"),
        description: formData.description || "",
        images: images,
        colorVariants: colorVariants.map((v) => ({
          color: v.color.trim(),
          quality: v.quality || "Standard",
          quantity: parseInt(String(v.quantity)) || 0,
          sku: v.sku || "",
          imageUrl: v.imageUrl || "",
        })),
        attributes: fieldConfigs.reduce((acc: any, field: any) => {
          const raw = formData[field.name];
          if (raw !== undefined && raw !== null && raw !== "") {
            acc[field.name] = isRefField(field) ? toId(raw) : raw;
          }
          return acc;
        }, {}),
      };

      const response = product
        ? await updateProduct(product._id, payload)
        : await createProduct(payload);

      if (response.success) {
        onSuccess?.();
        handleClose();
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-gray-500">
              Manage product details, Cloudinary images & color/quality stock variants
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
          {/* ─── Cloudinary Product Images ───────────────────────────────── */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <PhotoIcon className="h-4 w-4 text-indigo-600" />
                  Product Images (Cloudinary)
                </h3>
                <p className="text-xs text-gray-500">
                  Upload high-res product photos stored securely on Cloudinary
                </p>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg cursor-pointer transition shadow-xs">
                {uploadingImage ? (
                  <>
                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-3.5 w-3.5" />
                    Upload Image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="py-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-400">
                No images uploaded yet. Click "Upload Image" to add product photos.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white aspect-square flex items-center justify-center shadow-xs"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-2xs px-1.5 py-0.5 rounded font-medium shadow-xs">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          title="Set as Primary"
                          className="p-1 rounded bg-white text-indigo-600 hover:bg-indigo-50"
                        >
                          <CheckBadgeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Delete"
                        className="p-1 rounded bg-white text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Basic Information ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Aviator Titanium Frame"
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
                value={formData.sku ?? ""}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="e.g. FRM-AV-01"
                className={`w-full px-3 py-2 border ${errors.sku ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode ?? ""}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="e.g. 8901234567890"
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
                  <option key={cat._id || (cat as any).id} value={cat._id || (cat as any).id}>
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
              {subcategories.length === 0 && selectedCategory ? (
                <div className="w-full px-3 py-2 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                  <span>No subcategories available for this category</span>
                </div>
              ) : (
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
                    <option key={sub._id || (sub as any).id} value={sub._id || (sub as any).id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.subcategory && <p className="mt-1 text-xs text-red-500">{errors.subcategory}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={toId(formData.brand)}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.brand ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id || brand.id} value={brand._id || brand.id}>
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
                value={toId(formData.supplier)}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.supplier ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
              {errors.supplier && <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price ?? ""}
                onChange={(e) => handleInputChange("selling_price", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.selling_price ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.selling_price && <p className="mt-1 text-xs text-red-500">{errors.selling_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_price ?? ""}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.purchase_price ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.purchase_price && <p className="mt-1 text-xs text-red-500">{errors.purchase_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Stock Quantity <span className="text-red-500">*</span>
                {colorVariants.length > 0 && (
                  <span className="text-xs text-indigo-600 font-normal ml-1">
                    (Auto-synced from color variants)
                  </span>
                )}
              </label>
              <input
                type="number"
                value={formData.stock ?? ""}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                disabled={colorVariants.length > 0}
                className={`w-full px-3 py-2 border ${errors.stock ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50`}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
              <input
                type="number"
                value={formData.minimum_stock ?? ""}
                onChange={(e) => handleInputChange("minimum_stock", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

          {/* ─── Color-Wise Quality & Quantity Management ─────────────────── */}
          <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Color-Wise Quality & Quantity Management
                </h3>
                <p className="text-xs text-gray-500">
                  Track stock separately for each color option, quality grade & variant
                </p>
              </div>
              <button
                type="button"
                onClick={addColorVariant}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-xs"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add Color Variant
              </button>
            </div>

            {colorVariants.length === 0 ? (
              <div className="py-4 border border-dashed border-indigo-200 rounded-lg text-center text-xs text-gray-400 bg-white">
                No color variants added. Click "Add Color Variant" to configure stock by color & quality.
              </div>
            ) : (
              <div className="space-y-3">
                {colorVariants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-3">
                      <label className="block text-2xs font-semibold uppercase text-gray-500 mb-0.5">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Matte Black"
                        value={variant.color}
                        onChange={(e) => updateColorVariant(idx, "color", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-2xs font-semibold uppercase text-gray-500 mb-0.5">
                        Quality Grade
                      </label>
                      <select
                        value={variant.quality || "Standard"}
                        onChange={(e) => updateColorVariant(idx, "quality", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {QUALITY_OPTIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-semibold uppercase text-gray-500 mb-0.5">
                        Quantity (Stock) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={variant.quantity}
                        onChange={(e) => updateColorVariant(idx, "quantity", parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-2xs font-semibold uppercase text-gray-500 mb-0.5">
                        Variant SKU / Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BLK-STD"
                        value={variant.sku || ""}
                        onChange={(e) => updateColorVariant(idx, "sku", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeColorVariant(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove Variant"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Category-Specific Fields ─────────────────────────────────── */}
          {selectedCategory && fieldConfigs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Category-Specific Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldConfigs.map((field: any) => {
                  const options = getSelectOptions(field);
                  const rawValue = formData[field.name];
                  const value = isRefField(field) ? toId(rawValue) : rawValue ?? "";

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
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description ?? ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Detailed product specifications and features..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
