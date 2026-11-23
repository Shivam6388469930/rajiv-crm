import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import { seedDefaultData } from "@/lib/seedDefaults";

// High quality curated optical & eyewear product photos
const OPTICAL_IMAGES: Record<string, string[]> = {
  frame: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80",
  ],
  lens: [
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509695503492-4133869d22ee?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80",
  ],
  "contact-lens": [
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&auto=format&fit=crop&q=80",
  ],
  "cover-box": [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=80",
  ],
  "machinery-equipment": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
  ],
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80";

// Color palettes for variants
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
  [
    { color: "Clear Transparent", quality: "Standard", quantity: 30 },
    { color: "Smoke Grey", quality: "Premium", quantity: 18 },
    { color: "Emerald Amber", quality: "Original", quantity: 12 },
  ],
];

// Product name templates tailored to subcategories
const PRODUCT_TEMPLATES: Record<string, { names: string[]; priceRange: [number, number] }> = {
  // Frame subcategories
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

  // Lens subcategories
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

  // Contact Lens subcategories
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

  // Cover & Box subcategories
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

  // Accessories subcategories
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

  // Machinery & Equipment subcategories
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

export async function seedProductsPerCategory() {
  await connectDB();

  // 1. Ensure master data and categories exist
  await seedDefaultData();

  // 2. Ensure at least one active supplier exists
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
  }

  // Ensure second supplier
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
  }

  // 3. Load all categories and brands
  const categories = await Category.find({ isActive: true });
  const brands = await Brand.find({ isActive: true });

  const report = {
    totalCreated: 0,
    categoriesProcessed: 0,
    subcategoriesProcessed: 0,
    details: [] as { category: string; subcategory: string; created: number; total: number }[],
  };

  let globalSkuCounter = Date.now() % 100000;

  for (const category of categories) {
    report.categoriesProcessed++;
    const catSlug = category.slug.toLowerCase();

    // Pick photos for this category
    const catImages = OPTICAL_IMAGES[catSlug] || OPTICAL_IMAGES["frame"] || [DEFAULT_IMAGE];

    // Find brands matching this category
    let categoryBrands = brands.filter(
      (b) => b.category && b.category.toString() === category._id.toString()
    );
    if (categoryBrands.length === 0) {
      // Fallback: create a brand for this category if none exists
      const newBrand = await Brand.create({
        brandName: `${category.name} Select`,
        slug: `${catSlug}-select-${Date.now() % 1000}`,
        category: category._id,
        description: `Premium collection of ${category.name}`,
        isActive: true,
      });
      categoryBrands = [newBrand];
    }

    const subcategories = category.subcategories || [];

    for (const sub of subcategories) {
      report.subcategoriesProcessed++;
      const subSlug = (sub.slug || sub.name || "").toLowerCase().replace(/[^a-z0-9-]/g, "-");

      // Check current product count for this category + subcategory
      const existingCount = await Product.countDocuments({
        category: category._id,
        subcategory: sub._id,
      });

      const needed = Math.max(0, 5 - existingCount);
      let createdForSub = 0;

      // Get templates or fallback
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
          priceRange: [1499, 4999] as [number, number],
        };

      for (let i = 0; i < needed; i++) {
        globalSkuCounter++;
        const nameIndex = (existingCount + i) % template.names.length;
        const productName = `${template.names[nameIndex]} ${existingCount + i >= template.names.length ? `(V${existingCount + i + 1})` : ""}`.trim();

        const brand = categoryBrands[i % categoryBrands.length];
        const assignedSupplier = i % 2 === 0 ? supplier : backupSupplier;

        const [minPrice, maxPrice] = template.priceRange;
        const sellingPrice = Math.round(minPrice + Math.random() * (maxPrice - minPrice));
        const purchasePrice = Math.round(sellingPrice * (0.5 + Math.random() * 0.15));

        const prefix = (sub.name || "OPT").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
        const uniqueSku = `SKU-${prefix}-${String(globalSkuCounter).padStart(5, "0")}`;
        const barcode = `890${String(globalSkuCounter).padStart(9, "0")}`;

        // Select color variant template
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
          category: category._id,
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

        createdForSub++;
        report.totalCreated++;
      }

      report.details.push({
        category: category.name,
        subcategory: sub.name,
        created: createdForSub,
        total: existingCount + createdForSub,
      });
    }
  }

  return report;
}
