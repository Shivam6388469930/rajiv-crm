// scripts/seed-products.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

// Schemas
const subCategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    subcategories: [subCategorySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brandName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    supplyProduct: { type: String, default: "" },
    shopLocation: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    selling_price: { type: Number, required: true, min: 0 },
    purchase_price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minimum_stock: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive", "out_of_stock"], default: "active" },
    description: { type: String, trim: true },
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    images: [{ url: String, alt: String, isPrimary: { type: Boolean, default: false } }],
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
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const OPTICAL_IMAGES = {
  frame: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
  ],
  lens: [
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509695503492-4133869d22ee?w=800&auto=format&fit=crop&q=80",
  ],
  "contact-lens": [
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
  ],
  "cover-box": [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&auto=format&fit=crop&q=80",
  ],
  "machinery-equipment": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80",
  ],
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80";

const COLOR_SETS = [
  [
    { color: "Matte Black", quality: "Premium", quantity: 15 },
    { color: "Gunmetal Grey", quality: "Standard", quantity: 20 },
    { color: "Rose Gold", quality: "Premium", quantity: 12 },
  ],
  [
    { color: "Tortoise Shell", quality: "Original", quantity: 18 },
    { color: "Midnight Blue", quality: "Premium", quantity: 14 },
    { color: "Crystal Clear", quality: "Standard", quantity: 22 },
  ],
  [
    { color: "Silver Metallic", quality: "Standard", quantity: 25 },
    { color: "Classic Gold", quality: "Original", quantity: 16 },
    { color: "Brushed Bronze", quality: "Premium", quantity: 10 },
  ],
];

const PRODUCT_TEMPLATES = {
  "metal-frames": {
    names: [
      "Aviator Classic Metal Spectacle Frame",
      "Retro Round Wire Lightweight Optical Frame",
      "Executive Sleek Rectangle Monel Eyeglasses",
      "Pilot Double-Bridge Vintage Metal Frame",
      "Geometric Hexagonal Thin-Rim Metal Frame",
    ],
    priceRange: [1899, 4599],
  },
  "acetate-frames": {
    names: [
      "Handcrafted Cellulose Tortoise Acetate Frame",
      "Bold Square Onyx Black Acetate Eyewear",
      "Crystal Champagne Cat-Eye Designer Frame",
      "Vintage Havana Round Keyhole Acetate Frame",
      "Dual-Tone Gradient Wayfarer Acetate Spectacle",
    ],
    priceRange: [2499, 6299],
  },
  "tr90-frames": {
    names: [
      "Ultra-Flexible TR90 Featherweight Frame",
      "Sport-Wrap Bendable Ergonomic Eyeglasses",
      "Urban Matte Black Active-Wear TR90 Frame",
      "Impact-Resistant Lightweight Square TR90",
      "Junior Flexi-Hinge Unbreakable Eyewear Frame",
    ],
    priceRange: [1299, 2999],
  },
  "titanium-frames": {
    names: [
      "Pure Aerospace Grade Titanium Rimless Frame",
      "Beta-Titanium Memory Wire Ultra-Light Spectacle",
      "Brushed Platinum Executive Titanium Rectangle",
      "Featherlight Luxury Japanese Titanium Aviator",
      "Corrosion-Proof Hypoallergenic Titanium Classic",
    ],
    priceRange: [4999, 11999],
  },
  "rimless-frames": {
    names: [
      "Diamond-Cut Three-Piece Drill Rimless Frame",
      "Minimalist Nylon Supra Semi-Rimless Eyeglasses",
      "Silhouette Style Arch-Wire Rimless Frame",
      "Executive Semi-Rimless Half-Eye Reading Frame",
      "Frameless High-Index Tension Mounted Spectacle",
    ],
    priceRange: [2899, 6999],
  },
  "single-vision": {
    names: [
      "CR-39 Standard Single Vision Hard-Coated Lens",
      "1.56 Mid-Index Aspheric Anti-Reflective Lens Pair",
      "1.61 Hi-Index Ultra-Clear Impact Resistant SV",
      "1.67 Aspheric Super-Slim Single Vision Prescription",
      "1.74 Premium Ultra-Thin Diamond Glare-Free SV",
    ],
    priceRange: [999, 3999],
  },
  "bifocal-lenses": {
    names: [
      "D-Segment 28mm Wide Reading Bifocal Lens Pair",
      "Round-Top Invisible Line Fused Bifocal Lenses",
      "Executive Wide-Field Double Vision Resin Lens",
      "Photochromic Fast-Darkening Bifocal 1.56",
      "Hard Resin Anti-Scratch D-28 Bifocal Lens",
    ],
    priceRange: [1499, 4299],
  },
  "progressive-lenses": {
    names: [
      "Digital Freeform Easy-Adapt Progressive Lens",
      "Wide-Corridor Office & Computer Progressive",
      "Short Corridor Compact Fashion Frame Progressive",
      "Premium Panoramic Multi-Focal Digital Lens Pair",
      "Blue-Defend HD Freeform Progressive Lens",
    ],
    priceRange: [3499, 10999],
  },
  "blue-cut-lenses": {
    names: [
      "UV420 Digital Blue-Block Screen Protection 1.56",
      "Diamond Clean Blue-Shield Anti-Glare 1.60 Lens",
      "Night Driving & Digital Screen Dual-Filter Lens",
      "Gaming Ultra-Violet Blue-Violet Blocker Lens",
      "Hydrophobic Oleophobic Blue-Cut Aspheric 1.67",
    ],
    priceRange: [1299, 3899],
  },
  "photochromic-lenses": {
    names: [
      "Fast-Reaction Transition Grey Photochromic 1.56",
      "Amber Brown Fast-Darken Sunlight Transition Lens",
      "Ultra-Thin 1.67 Aspheric UV-Reactive Lens Pair",
      "Blue-Light Blocking Photochromic 1.60 Transition",
      "Polarized Drivewear Clear-to-Dark Photochromic",
    ],
    priceRange: [2199, 5899],
  },
  "daily-disposable": {
    names: [
      "AquaComfort Moist Daily Disposable Pack (30 pcs)",
      "Hydragel 1-Day Oxygen-Rich Contact Lenses",
      "Bio-True Breathable Single-Use Contact Lenses",
      "Silicone Hydrogel Daily Ultra-Moisture Lenses",
      "Comfort-Air Daily UV-Blocking Clear Contact Pack",
    ],
    priceRange: [1199, 2899],
  },
  "monthly-disposable": {
    names: [
      "PureOxygen Monthly Extended Wear Lenses (6 pack)",
      "Ultra-Hydra 30-Day Breathable Contact Lenses",
      "Hydrogel Monthly High-Lubrication Eye Lenses",
      "Precision Balance Monthly Extended Vision Pack",
      "Air-Permeable Night & Day 30-Day Contact Lenses",
    ],
    priceRange: [1499, 3499],
  },
  "toric-astigmatism": {
    names: [
      "Precision-Axis Toric Daily Disposable Lenses (30 pk)",
      "Stable-Fit Astigmatism Monthly Toric Contact Pack",
      "Auto-Aligning Silicone Hydrogel Toric Lenses",
      "Comfort-Lock Cylinder Axis Soft Toric Lenses",
      "Ultra-Clear High Astigmatism Correction Pack",
    ],
    priceRange: [1899, 4199],
  },
  "cosmetic-color-lenses": {
    names: [
      "Hazel Honey Tri-Tone Natural Cosmetic Lenses",
      "Sterling Silver Grey Blend Soft Beauty Lenses",
      "Mystic Ocean Blue Monthly Cosmetic Contact Lens",
      "Pure Green Emerald Eye Enhancement Lenses",
      "Warm Chestnut Brown Monthly Cosmetic Lenses",
    ],
    priceRange: [899, 2199],
  },
  "hard-clamshell-case": {
    names: [
      "Luxury Velvet-Lined Crushproof Metal Clamshell",
      "Shockproof Carbon Texture Hard Optical Case",
      "Vintage Leatherette Magnetic Snap Hard Case",
      "Ultra-Slim Aircraft Aluminum Protective Eyewear Box",
      "Rugged Spring-Hinge Heavy-Duty Glasses Case",
    ],
    priceRange: [299, 799],
  },
  "leather-pouch": {
    names: [
      "Handcrafted Distressed Tan Leather Slip Pouch",
      "Soft Squeeze-Top Napa Leather Eyewear Sleeve",
      "Slimline Italian Faux Leather Protective Pouch",
      "Drawstring Microfiber & Leather Travel Case",
      "Embossed Designer Eyewear Leather Slip Cover",
    ],
    priceRange: [199, 649],
  },
  "microfiber-cleaning-kit": {
    names: [
      "Anti-Fog Lens Spray (60ml) + Microfiber Kit",
      "Ultra-Dense Silk Edge Microfiber Cleaning Cloths (5 pk)",
      "Professional Optical Laboratory Cleaner 100ml Set",
      "Pre-Moistened Lens Sanitizing Wipes (50 count)",
      "Deluxe Eyewear Care & Ultrasonic Cleaning Solution",
    ],
    priceRange: [149, 499],
  },
  "silicone-nose-pads": {
    names: [
      "Air-Cushion Screw-in Soft Silicone Nose Pads (10 pairs)",
      "Push-in Hypoallergenic German Grade Nose Pads",
      "Anti-Slip Saddle Bridge Universal Nose Pad (5 pk)",
      "Titanium-Core Soft Clear Eyewear Nose Pads",
      "Self-Adhesive Anti-Slide Eyewear Silicone Pads",
    ],
    priceRange: [99, 399],
  },
  "eyewear-chains-cords": {
    names: [
      "18K Gold Plated Cable Chain Eyewear Retainer",
      "Braided Sports Floating Neoprene Eyewear Cord",
      "Classic Black Onyx Bead Fashion Glasses Chain",
      "Adjustable Silicone Grip Non-Slip Sports Strap",
      "Pearl Beaded Luxury Eyewear Holder Necklace",
    ],
    priceRange: [199, 799],
  },
  "optical-tools": {
    names: [
      "4-in-1 Precision Keyring Optical Screwdriver Set",
      "Workshop Screw Assortment Tray (1000 pcs + Tweezers)",
      "Nylon Jaw Temple & Hinge Alignment Pliers",
      "Rimless Frame Nut Driver & Threading Multi-Tool",
      "Professional Optical Dispensing Repair Bench Kit",
    ],
    priceRange: [299, 1899],
  },
  "auto-lens-edger": {
    names: [
      "3D Digital Patternless Automatic Lens Edger System",
      "High-Speed Multi-Axis Bevel & Grooving Edger",
      "Compact Optical Laboratory Lens Finishing Station",
      "Touchscreen Smart Auto Milling & Edging Unit",
      "High Precision Hydrophobic Anti-Slip Lens Edger",
    ],
    priceRange: [85000, 240000],
  },
  "digital-lensometer": {
    names: [
      "Hartmann Sensor Digital Auto Focimeter Lensometer",
      "High-Res 7-inch LCD Touchscreen Auto Lensometer",
      "UV & Blue-Light Analyzer Digital Lens Power Meter",
      "Compact Auto-Focusing Progressive Lens Analyzer",
      "Thermal Printer Equipped Digital Auto Lensometer",
    ],
    priceRange: [38000, 95000],
  },
  "auto-refractometer": {
    names: [
      "Intelligent 3D Auto-Tracking Refractometer / Keratometer",
      "High-Speed Color Screen Automated Eye Refractor",
      "Corneal Curvature & Pupil Distance Auto Refractometer",
      "Portable Handheld Pediatric Optical Autorefractor",
      "Fog-Target Optical Diagnostic Auto Refractometer Station",
    ],
    priceRange: [115000, 310000],
  },
};

async function runSeed() {
  console.log("🚀 Connecting to MongoDB at:", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
  await mongoose.connect(MONGODB_URI);
  console.log(" Connected to MongoDB successfully.\n");

  // Suppliers
  let supplier = await Supplier.findOne({ status: "active" });
  if (!supplier) {
    supplier = await Supplier.create({
      supplierName: "Shivam Agrahari - Vision Optical Wholesalers",
      email: "shivam@visionoptical.com",
      phone: "+91 9876543210",
      supplyProduct: "Spectacle Frames, Prescription Lenses & Optical Tools",
      shopLocation: "Shop 104, Optical Wholesale Market, Mumbai",
      status: "active",
    });
    console.log(" Created default supplier: Shivam Agrahari");
  }

  let backupSupplier = await Supplier.findOne({ email: "orders@apexeyecare.com" });
  if (!backupSupplier) {
    backupSupplier = await Supplier.create({
      supplierName: "Apex Eyecare Logistics & Supplies",
      email: "orders@apexeyecare.com",
      phone: "+91 9811223344",
      supplyProduct: "Contact Lenses, Cases & Diagnostic Machinery",
      shopLocation: "B-12 Eyecare Industrial Estate, Delhi",
      status: "active",
    });
    console.log(" Created secondary supplier: Apex Eyecare Logistics");
  }

  const categories = await Category.find({ isActive: true });
  const brands = await Brand.find({ isActive: true });

  console.log(` Found ${categories.length} active categories.`);

  let totalAdded = 0;
  let skuCounter = Date.now() % 100000;

  for (const cat of categories) {
    console.log(`\n======================================================`);
    console.log(`📂 Processing Category: [${cat.name}]`);
    console.log(`======================================================`);

    const catSlug = (cat.slug || "").toLowerCase();
    const catImages = OPTICAL_IMAGES[catSlug] || OPTICAL_IMAGES["frame"] || [DEFAULT_IMAGE];

    let categoryBrands = brands.filter(
      (b) => b.category && b.category.toString() === cat._id.toString()
    );
    if (categoryBrands.length === 0) {
      const fallbackBrand = await Brand.create({
        brandName: `${cat.name} Select`,
        slug: `${catSlug}-select-${Date.now() % 10000}`,
        category: cat._id,
        description: `Official collection for ${cat.name}`,
        isActive: true,
      });
      categoryBrands = [fallbackBrand];
    }

    const subcategories = cat.subcategories || [];
    for (const sub of subcategories) {
      const subSlug = (sub.slug || sub.name || "").toLowerCase().replace(/[^a-z0-9-]/g, "-");

      const existingCount = await Product.countDocuments({
        category: cat._id,
        subcategory: sub._id,
      });

      const needed = Math.max(0, 5 - existingCount);
      console.log(`  📁 Subcategory: "${sub.name}" (Current products: ${existingCount}, Needed: ${needed})`);

      if (needed <= 0) continue;

      const template =
        PRODUCT_TEMPLATES[subSlug] ||
        PRODUCT_TEMPLATES[Object.keys(PRODUCT_TEMPLATES).find((k) => subSlug.includes(k) || k.includes(subSlug)) || ""] || {
          names: [
            `${sub.name} Pro Edition`,
            `${sub.name} Classic Choice`,
            `${sub.name} Premium Ultra`,
            `${sub.name} Everyday Comfort`,
            `${sub.name} Elite Series`,
          ],
          priceRange: [1499, 4999],
        };

      for (let i = 0; i < needed; i++) {
        skuCounter++;
        const nameIdx = (existingCount + i) % template.names.length;
        const productName = `${template.names[nameIdx]} ${existingCount + i >= template.names.length ? `(V${existingCount + i + 1})` : ""}`.trim();

        const brand = categoryBrands[i % categoryBrands.length];
        const assignedSupplier = i % 2 === 0 ? supplier : backupSupplier;

        const [minPrice, maxPrice] = template.priceRange;
        const sellingPrice = Math.round(minPrice + Math.random() * (maxPrice - minPrice));
        const purchasePrice = Math.round(sellingPrice * (0.5 + Math.random() * 0.15));

        const prefix = (sub.name || "OPT").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
        const uniqueSku = `SKU-${prefix}-${String(skuCounter).padStart(5, "0")}`;
        const barcode = `890${String(skuCounter).padStart(9, "0")}`;

        const variantSet = COLOR_SETS[(existingCount + i) % COLOR_SETS.length];
        const imgUrl = catImages[(existingCount + i) % catImages.length] || DEFAULT_IMAGE;

        const colorVariants = variantSet.map((v, idx) => ({
          color: v.color,
          quality: v.quality,
          quantity: v.quantity + Math.floor(Math.random() * 10),
          sku: `${uniqueSku}-C${idx + 1}`,
          imageUrl: imgUrl,
        }));

        const totalStock = colorVariants.reduce((sum, v) => sum + v.quantity, 0);

        await Product.create({
          name: productName,
          category: cat._id,
          subcategory: sub._id,
          sku: uniqueSku,
          barcode,
          brand: brand._id,
          supplier: assignedSupplier._id,
          selling_price: sellingPrice,
          purchase_price: purchasePrice,
          stock: totalStock,
          minimum_stock: 5,
          status: "active",
          description: `High precision ${sub.name} designed for optical excellence. Features premium materials, durable construction, and full quality compliance. Suitable for professional eye clinics and retail optical stores.`,
          images: [
            {
              url: imgUrl,
              alt: productName,
              isPrimary: true,
            },
            {
              url: catImages[(existingCount + i + 1) % catImages.length] || DEFAULT_IMAGE,
              alt: `${productName} angle view`,
              isPrimary: false,
            },
          ],
          colorVariants,
        });

        console.log(`    + Created: ${productName} (SKU: ${uniqueSku}, Stock: ${totalStock}, ₹${sellingPrice})`);
        totalAdded++;
      }
    }
  }

  console.log(`\n🎉 PRODUCT SEEDING COMPLETE! Added ${totalAdded} optical products across all categories & subcategories.`);
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("\n❌ Product seeding failed:", err);
  process.exit(1);
});
