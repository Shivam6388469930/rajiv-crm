// app/customer/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  BoltIcon,
  CheckIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getProducts, Product } from "@/app/services/product.service";
import { getCategories } from "@/app/services/category.service";
import { addToCart } from "@/lib/customerCart";
import {
  getAdminWhatsAppNumber,
  generateWhatsAppLink,
  formatProductInquiryWhatsAppMessage,
} from "@/lib/whatsapp";

export default function CustomerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Product Selection States (per product card: { [productId]: { colorIndex, qty } })
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, { color: string; quality: string; maxStock: number; qty: number }>
  >({});

  // Quick View Modal
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data);

        // Initialize default variant selection for products that have colorVariants
        const initialVariants: Record<string, any> = {};
        prodsRes.data.forEach((p) => {
          if (p.colorVariants && p.colorVariants.length > 0) {
            const first = p.colorVariants[0];
            initialVariants[p._id] = {
              color: first.color,
              quality: first.quality || "Standard",
              maxStock: first.quantity || 0,
              qty: 1,
            };
          } else {
            initialVariants[p._id] = {
              color: "Default",
              quality: "Standard",
              maxStock: p.stock || 0,
              qty: 1,
            };
          }
        });
        setSelectedVariants(initialVariants);
      }

      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
      }
    } catch (e) {
      console.error("Failed to load catalog", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectColor = (productId: string, variant: any) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: {
        color: variant.color,
        quality: variant.quality || "Standard",
        maxStock: variant.quantity || 0,
        qty: 1,
      },
    }));
  };

  const handleQtyChange = (productId: string, qty: number) => {
    setSelectedVariants((prev) => {
      const current = prev[productId];
      const safeQty = Math.max(1, Math.min(qty, current?.maxStock || 9999));
      return {
        ...prev,
        [productId]: {
          ...current,
          qty: safeQty,
        },
      };
    });
  };

  const handleAddToCart = (product: Product, redirectNow = false) => {
    const variant = selectedVariants[product._id] || {
      color: "Default",
      quality: "Standard",
      maxStock: product.stock,
      qty: 1,
    };

    if (variant.maxStock <= 0) {
      alert("Selected variant is currently out of stock.");
      return;
    }

    const primaryImg =
      product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "";

    addToCart({
      product_id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.selling_price,
      color: variant.color !== "Default" ? variant.color : undefined,
      quality: variant.quality,
      quantity: variant.qty,
      maxStock: variant.maxStock,
      imageUrl: primaryImg,
    });

    if (redirectNow) {
      router.push("/customer/cart");
    } else {
      setAddedSuccessId(product._id);
      setTimeout(() => setAddedSuccessId(null), 2500);
    }
  };

  const handleWhatsAppOrder = (product: Product) => {
    const variant = selectedVariants[product._id];
    const adminPhone = getAdminWhatsAppNumber();
    const text = formatProductInquiryWhatsAppMessage(
      product.name,
      product.sku,
      variant?.color !== "Default" ? variant?.color : undefined,
      variant?.quality,
      product.selling_price
    );
    const link = generateWhatsAppLink(adminPhone, text);
    window.open(link, "_blank");
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof p.brand === "object" && p.brand?.brandName?.toLowerCase().includes(searchQuery.toLowerCase()));

    const categoryId = typeof p.category === "object" ? p.category?._id : p.category;
    const matchesCategory =
      !selectedCategory || categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider inline-block mb-3">
            Wholesale & Retail Optical Products
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Premium Frames, Lenses & Optical Supplies
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Browse our full catalog with color-wise quality & quantity availability. Order directly online or via WhatsApp with fast dispatch.
          </p>
        </div>
      </div>

      {/* ─── Search & Category Filters Bar ───────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === ""
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id || cat.id}
              onClick={() => setSelectedCategory(cat._id || cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === (cat._id || cat.id)
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Product Catalog Grid ────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading catalog products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-500 max-w-md mx-auto">
          <EyeIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-800">No Products Found</h3>
          <p className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting another category.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className="mt-4 px-4 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const primaryImg =
              product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;

            const selected = selectedVariants[product._id] || {
              color: "Default",
              quality: "Standard",
              maxStock: product.stock,
              qty: 1,
            };

            const isOutOfStock = selected.maxStock <= 0;
            const isAdded = addedSuccessId === product._id;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Image Display */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden group">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <EyeIcon className="h-12 w-12 stroke-1" />
                        <span className="text-2xs text-gray-400 mt-1">No Image</span>
                      </div>
                    )}

                    {/* Quick View Button Overlay */}
                    <button
                      onClick={() => setActiveModalProduct(product)}
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Quick View
                    </button>

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-rose-600 text-white shadow-xs">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-600 text-white shadow-xs">
                          In Stock ({selected.maxStock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600">
                        {typeof product.brand === "object" ? product.brand?.brandName : "Optical Brand"}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-gray-900">
                        ${product.selling_price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">/ unit</span>
                    </div>

                    {/* ─── Color & Quality Variant Selector ─── */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <label className="block text-2xs font-bold uppercase text-gray-500 mb-1.5">
                          Select Color & Quality:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {product.colorVariants.map((v: any, idx: number) => {
                            const isSelected = selected.color === v.color;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectColor(product._id, v)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {v.color} ({v.quality || "Std"})
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-1 text-2xs text-gray-500 flex justify-between">
                          <span>Quality: <b>{selected.quality}</b></span>
                          <span>Available: <b>{selected.maxStock} units</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Actions: Quantity & Buy Buttons ─── */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(product._id, selected.qty - 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 text-sm font-bold"
                        disabled={selected.qty <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900 w-8 text-center">
                        {selected.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(product._id, selected.qty + 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 text-sm font-bold"
                        disabled={selected.qty >= selected.maxStock}
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product, false)}
                      disabled={isOutOfStock}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition shadow-xs ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : isOutOfStock
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon className="h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>

                  {/* Buy Now & WhatsApp Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product, true)}
                      disabled={isOutOfStock}
                      className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <BoltIcon className="h-3.5 w-3.5" />
                      Buy Now
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrder(product)}
                      className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                      title="Directly inquire or order via WhatsApp"
                    >
                      {/* WhatsApp Icon */}
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Quick View Product Modal ─────────────────────────────────────── */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Gallery */}
              <div className="space-y-2">
                <div className="h-64 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-100">
                  {activeModalProduct.images?.[0]?.url ? (
                    <img
                      src={activeModalProduct.images[0].url}
                      alt={activeModalProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <EyeIcon className="h-16 w-16 text-gray-300 stroke-1" />
                  )}
                </div>
                {activeModalProduct.images && activeModalProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeModalProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt=""
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeModalProduct.name}</h2>
                  <p className="text-xs text-gray-500 mt-1">SKU: {activeModalProduct.sku}</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-2">
                    ${activeModalProduct.selling_price.toFixed(2)}
                  </p>
                </div>

                {activeModalProduct.description && (
                  <div className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {activeModalProduct.description}
                  </div>
                )}

                {/* Color Variants Details */}
                {activeModalProduct.colorVariants && activeModalProduct.colorVariants.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">Available Variants:</h4>
                    <div className="space-y-1.5 text-xs">
                      {activeModalProduct.colorVariants.map((v: any, i: number) => (
                        <div key={i} className="flex justify-between p-1.5 rounded-md bg-gray-50">
                          <span className="font-semibold text-gray-800">{v.color} ({v.quality || "Standard"})</span>
                          <span className="text-gray-600 font-medium">{v.quantity} in stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(activeModalProduct, false);
                      setActiveModalProduct(null);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(activeModalProduct)}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
