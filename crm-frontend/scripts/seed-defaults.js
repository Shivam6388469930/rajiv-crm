// scripts/seed-defaults.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

// Subcategory Schema
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

const frameShapeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const lensIndexSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const lensTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const boxMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const boxPrintSchema = new mongoose.Schema(
  {
    printName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const settingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "OpticCRM Solutions" },
    email: { type: String, default: "contact@opticcrm.com" },
    phone: { type: String, default: "+91 9876543210" },
    gstin: { type: String, default: "27AABCO1234F1Z5" },
    address: { type: String, default: "101 Optical Avenue, Eyecare Hub" },
    city: { type: String, default: "Mumbai" },
    pincode: { type: String, default: "400001" },
    website: { type: String, default: "https://opticcrm.com" },
    currencySymbol: { type: String, default: "₹" },
    defaultGstPercent: { type: Number, default: 12 },
    invoicePrefix: { type: String, default: "INV" },
    invoiceFooterNotes: { type: String, default: "Thank you for choosing OpticCRM." },
    termsAndConditions: { type: String, default: "1. Goods once sold can be exchanged within 7 days." },
    whatsappNumber: { type: String, default: "919876543210" },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
const FrameShape = mongoose.models.FrameShape || mongoose.model("FrameShape", frameShapeSchema);
const LensIndex = mongoose.models.LensIndex || mongoose.model("LensIndex", lensIndexSchema);
const LensType = mongoose.models.LensType || mongoose.model("LensType", lensTypeSchema);
const BoxMaterial = mongoose.models.BoxMaterial || mongoose.model("BoxMaterial", boxMaterialSchema);
const BoxPrint = mongoose.models.BoxPrint || mongoose.model("BoxPrint", boxPrintSchema);
const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);

async function runSeed() {
  console.log("🚀 Connecting to MongoDB at:", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
  await mongoose.connect(MONGODB_URI);
  console.log(" Connected to MongoDB successfully.\n");

  console.log("🌱 Starting default optical master data seeding...\n");

  // 1. Categories & Subcategories
  const categoriesData = [
    {
      name: "Frame",
      slug: "frame",
      description: "Optical and sunglasses spectacle frames in various materials and styles",
      subcategories: [
        { name: "Metal Frames", slug: "metal-frames", description: "Stainless steel, monel, and classic metallic frames" },
        { name: "Acetate Frames", slug: "acetate-frames", description: "Premium handcrafted cellulose acetate frames" },
        { name: "TR90 Ultra-Light", slug: "tr90-frames", description: "Flexible, ultra-durable thermoplastic frames" },
        { name: "Titanium & Beta-Titanium", slug: "titanium-frames", description: "Hypoallergenic, ultra-lightweight aerospace grade frames" },
        { name: "Rimless & Semi-Rimless", slug: "rimless-frames", description: "Minimalist rimless drill-mount and supra nylon cord frames" },
      ],
    },
    {
      name: "Lens",
      slug: "lens",
      description: "Prescription and plano optical lenses with multi-coatings",
      subcategories: [
        { name: "Single Vision", slug: "single-vision", description: "Distance, reading, or computer single vision lenses" },
        { name: "Bifocal Lenses", slug: "bifocal-lenses", description: "D-segment, round-top, and executive bifocal lenses" },
        { name: "Progressive Lenses", slug: "progressive-lenses", description: "Freeform digital no-line progressive multifocal lenses" },
        { name: "Blue Cut Anti-Glare", slug: "blue-cut-lenses", description: "Digital screen blue block UV420 filter lenses" },
        { name: "Photochromic Transition", slug: "photochromic-lenses", description: "Fast tint changing UV reactive indoor-outdoor lenses" },
      ],
    },
    {
      name: "Contact Lens",
      slug: "contact-lens",
      description: "Soft contact lenses, toric lenses, and cosmetic color lenses",
      subcategories: [
        { name: "Daily Disposable", slug: "daily-disposable", description: "Single use daily sterile hygienic contact lenses" },
        { name: "Monthly Disposable", slug: "monthly-disposable", description: "High oxygen permeability 30-day extended wear lenses" },
        { name: "Toric (Astigmatism)", slug: "toric-astigmatism", description: "Precision axis stabilization for astigmatism correction" },
        { name: "Cosmetic Color Lenses", slug: "cosmetic-color-lenses", description: "Aesthetic color lenses in honey, hazel, grey, and sapphire" },
      ],
    },
    {
      name: "Cover & Box",
      slug: "cover-box",
      description: "Protective optical cases, luxury packaging boxes, and pouches",
      subcategories: [
        { name: "Hard Clamshell Case", slug: "hard-clamshell-case", description: "Rigid crush-proof magnetic and spring hinge cases" },
        { name: "Leather Pouch", slug: "leather-pouch", description: "Soft genuine and faux leather slip-in pouches" },
        { name: "Microfiber Cleaning Kit", slug: "microfiber-cleaning-kit", description: "High-density microfiber cloths and anti-fog spray kits" },
      ],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Optical workshop supplies, nose pads, screws, and cords",
      subcategories: [
        { name: "Silicone Nose Pads", slug: "silicone-nose-pads", description: "Screw-in and push-in hypoallergenic soft silicone pads" },
        { name: "Eyewear Chains & Cords", slug: "eyewear-chains-cords", description: "Fashion metal chains, sports cords, and retainers" },
        { name: "Optical Screwdrivers & Tools", slug: "optical-tools", description: "Miniature screwdriver sets, pliers, and screw trays" },
      ],
    },
    {
      name: "Machinery & Equipment",
      slug: "machinery-equipment",
      description: "Optical laboratory, lens edging, and diagnostic machinery",
      subcategories: [
        { name: "Auto Lens Edger", slug: "auto-lens-edger", description: "Computer numerical 3D patternless lens edging machines" },
        { name: "Digital Auto Lensometer", slug: "digital-lensometer", description: "Hartmann sensor automated focal power measurement meters" },
        { name: "Auto Refractometer / Keratometer", slug: "auto-refractometer", description: "High precision automated eye refraction test equipment" },
      ],
    },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    let doc = await Category.findOne({ slug: cat.slug });
    if (!doc) {
      doc = await Category.create(cat);
      console.log(` Created Category: ${cat.name} (${cat.subcategories.length} subcategories)`);
    } else {
      let updated = false;
      for (const sub of cat.subcategories) {
        if (!doc.subcategories.some((s) => s.slug === sub.slug || s.name === sub.name)) {
          doc.subcategories.push(sub);
          updated = true;
        }
      }
      if (updated) await doc.save();
      console.log(` Existing Category: ${cat.name}`);
    }
    catMap[cat.slug] = doc;
  }

  // 2. Brands
  const frameCat = catMap["frame"] || (await Category.findOne({ slug: "frame" }));
  const lensCat = catMap["lens"] || (await Category.findOne({ slug: "lens" }));
  const contactCat = catMap["contact-lens"] || (await Category.findOne({ slug: "contact-lens" }));

  const brandsData = [
    { brandName: "Ray-Ban", slug: "ray-ban", category: frameCat?._id, description: "Timeless eyewear icons like Aviator and Wayfarer" },
    { brandName: "Oakley", slug: "oakley", category: frameCat?._id, description: "Performance sport eyewear and proprietary O-Matter frames" },
    { brandName: "Velocity", slug: "velocity", category: frameCat?._id, description: "Contemporary urban fashion frames and blue-block collections" },
    { brandName: "Fastrack", slug: "fastrack", category: frameCat?._id, description: "Trendy, youth-centric sunglasses and optical frames" },
    { brandName: "Titan Eyeplus", slug: "titan-eyeplus", category: frameCat?._id, description: "High precision, reliable everyday eyewear frames" },
    { brandName: "Essilor", slug: "essilor", category: lensCat?._id, description: "World leader in ophthalmic lenses, Crizal & Varilux" },
    { brandName: "Carl Zeiss", slug: "carl-zeiss", category: lensCat?._id, description: "German precision optics, ClearView, and DuraVision coatings" },
    { brandName: "Hoya", slug: "hoya", category: lensCat?._id, description: "Advanced Japanese optical glass and premium Hi-Vision coatings" },
    { brandName: "Bausch & Lomb", slug: "bausch-lomb", category: contactCat?._id, description: "Global eye health pioneer, PureVision & Biotrue contact lenses" },
    { brandName: "Acuvue", slug: "acuvue", category: contactCat?._id, description: "Johnson & Johnson breathable HydraLuxe contact lenses" },
  ];

  console.log("\n--- Seeding Brands ---");
  for (const b of brandsData) {
    if (!b.category) continue;
    const existing = await Brand.findOne({ slug: b.slug });
    if (!existing) {
      await Brand.create(b);
      console.log(` Created Brand: ${b.brandName}`);
    } else {
      console.log(` Existing Brand: ${b.brandName}`);
    }
  }

  // 3. Frame Shapes
  const frameShapesData = [
    { name: "Aviator", slug: "aviator" },
    { name: "Wayfarer", slug: "wayfarer" },
    { name: "Round", slug: "round" },
    { name: "Rectangle", slug: "rectangle" },
    { name: "Square", slug: "square" },
    { name: "Cat Eye", slug: "cat-eye" },
    { name: "Oval", slug: "oval" },
    { name: "Geometric / Hexagonal", slug: "geometric" },
    { name: "Clubmaster / Browline", slug: "clubmaster" },
    { name: "Rimless Classic", slug: "rimless-classic" },
  ];

  console.log("\n--- Seeding Frame Shapes ---");
  for (const shape of frameShapesData) {
    const existing = await FrameShape.findOne({ slug: shape.slug });
    if (!existing) {
      await FrameShape.create(shape);
      console.log(` Created Frame Shape: ${shape.name}`);
    } else {
      console.log(` Existing Frame Shape: ${shape.name}`);
    }
  }

  // 4. Lens Indices
  const lensIndicesData = [
    { value: "1.50", label: "1.50 Standard Index (CR-39)" },
    { value: "1.56", label: "1.56 Mid-Index (Thin & Lightweight)" },
    { value: "1.59", label: "1.59 Polycarbonate (High Impact Resistant)" },
    { value: "1.60", label: "1.60 High-Index (Super Thin MR-8)" },
    { value: "1.67", label: "1.67 Ultra High-Index (Extra Thin for High Power)" },
    { value: "1.74", label: "1.74 Ultra Thin Aspheric (Premium Slim Profile)" },
  ];

  console.log("\n--- Seeding Lens Indices ---");
  for (const idx of lensIndicesData) {
    const existing = await LensIndex.findOne({ value: idx.value });
    if (!existing) {
      await LensIndex.create(idx);
      console.log(` Created Lens Index: ${idx.value} (${idx.label})`);
    } else {
      console.log(` Existing Lens Index: ${idx.value}`);
    }
  }

  // 5. Lens Types
  const lensTypesData = [
    { name: "Single Vision (SV)", slug: "single-vision" },
    { name: "Bifocal (D-Segment)", slug: "bifocal-d-segment" },
    { name: "Progressive / Multifocal", slug: "progressive-multifocal" },
    { name: "Blue Light Block (UV420)", slug: "blue-light-block-uv420" },
    { name: "Photochromic / Transition", slug: "photochromic-transition" },
    { name: "Polarized Sun Protection", slug: "polarized-sun-protection" },
    { name: "Anti-Reflective Hydrophobic", slug: "anti-reflective-hydrophobic" },
  ];

  console.log("\n--- Seeding Lens Types ---");
  for (const lt of lensTypesData) {
    const existing = await LensType.findOne({ slug: lt.slug });
    if (!existing) {
      await LensType.create(lt);
      console.log(` Created Lens Type: ${lt.name}`);
    } else {
      console.log(` Existing Lens Type: ${lt.name}`);
    }
  }

  // 6. Box Materials
  const boxMaterialsData = [
    { name: "Premium Leatherette (Faux Leather)", slug: "premium-leatherette" },
    { name: "Hard Shell Shockproof Plastic", slug: "hard-shell-plastic" },
    { name: "Metal Clamshell Spring Hinge", slug: "metal-clamshell" },
    { name: "Natural Bamboo & Wood Eco-Box", slug: "bamboo-wood-eco-box" },
    { name: "Rigid Kraft Paper Cardboard", slug: "rigid-kraft-paper-cardboard" },
    { name: "Soft Fabric Zip EVA Protective Case", slug: "soft-fabric-zip-eva" },
  ];

  console.log("\n--- Seeding Box Materials ---");
  for (const bm of boxMaterialsData) {
    const existing = await BoxMaterial.findOne({ slug: bm.slug });
    if (!existing) {
      await BoxMaterial.create(bm);
      console.log(` Created Box Material: ${bm.name}`);
    } else {
      console.log(` Existing Box Material: ${bm.name}`);
    }
  }

  // 7. Box Print Types
  const boxPrintsData = [
    { printName: "Gold Metallic Hot Foil Stamping" },
    { printName: "Silver Foil Stamping" },
    { printName: "Embossed / Debossed 3D Logo" },
    { printName: "UV Spot Multi-Color Screen Printing" },
    { printName: "Precision Laser Engraving" },
    { printName: "Full Color Thermal Transfer Sublimation" },
  ];

  console.log("\n--- Seeding Box Print Types ---");
  for (const bp of boxPrintsData) {
    const existing = await BoxPrint.findOne({ printName: bp.printName });
    if (!existing) {
      await BoxPrint.create(bp);
      console.log(` Created Box Print: ${bp.printName}`);
    } else {
      console.log(` Existing Box Print: ${bp.printName}`);
    }
  }

  // 8. Settings
  const existingSetting = await Setting.findOne();
  if (!existingSetting) {
    await Setting.create({
      companyName: "OpticCRM Solutions",
      email: "contact@opticcrm.com",
      phone: "+91 9876543210",
      gstin: "27AABCO1234F1Z5",
      address: "101 Optical Avenue, Eyecare Hub",
      city: "Mumbai",
      pincode: "400001",
      website: "https://opticcrm.com",
      currencySymbol: "₹",
      defaultGstPercent: 12,
      invoicePrefix: "INV",
      invoiceFooterNotes: "Thank you for choosing OpticCRM. All frames and lenses include a 1-year warranty against manufacturing defects.",
      termsAndConditions: "1. Goods once sold can be exchanged within 7 days with original tax invoice.\n2. Customized power lenses cannot be cancelled once processed in the laboratory.",
      whatsappNumber: "919876543210",
    });
    console.log("\n Created Default Store Setting record.");
  } else {
    console.log("\n Existing Store Setting verified.");
  }

  console.log("\n🎉 Default master data seeding completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("\n❌ Seeding failed with error:", err);
  process.exit(1);
});
