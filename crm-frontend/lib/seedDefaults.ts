import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import FrameShape from "@/models/FrameShape";
import LensIndex from "@/models/LensIndex";
import LensType from "@/models/LensType";
import BoxMaterial from "@/models/BoxMaterial";
import BoxPrint from "@/models/BoxPrint";
import Setting from "@/models/Setting";

export async function seedDefaultData() {
  await connectDB();

  const results = {
    categoriesAdded: 0,
    categoriesExisting: 0,
    brandsAdded: 0,
    brandsExisting: 0,
    frameShapesAdded: 0,
    frameShapesExisting: 0,
    lensIndicesAdded: 0,
    lensIndicesExisting: 0,
    lensTypesAdded: 0,
    lensTypesExisting: 0,
    boxMaterialsAdded: 0,
    boxMaterialsExisting: 0,
    boxPrintsAdded: 0,
    boxPrintsExisting: 0,
    settingsInitialized: false,
  };

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

  const categoryMap = new Map<string, any>();

  for (const cat of categoriesData) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        subcategories: cat.subcategories,
        isActive: true,
      });
      results.categoriesAdded++;
    } else {
      results.categoriesExisting++;
      // Sync subcategories if missing
      let changed = false;
      for (const sub of cat.subcategories) {
        if (!existing.subcategories.some((s: any) => s.slug === sub.slug || s.name === sub.name)) {
          existing.subcategories.push(sub);
          changed = true;
        }
      }
      if (changed) await existing.save();
    }
    categoryMap.set(cat.slug, existing);
  }

  // 2. Brands
  const frameCategory = categoryMap.get("frame") || (await Category.findOne({ slug: "frame" }));
  const lensCategory = categoryMap.get("lens") || (await Category.findOne({ slug: "lens" }));
  const contactCategory = categoryMap.get("contact-lens") || (await Category.findOne({ slug: "contact-lens" }));

  const brandsData = [
    { brandName: "Ray-Ban", slug: "ray-ban", category: frameCategory?._id, description: "Timeless eyewear icons like Aviator and Wayfarer" },
    { brandName: "Oakley", slug: "oakley", category: frameCategory?._id, description: "Performance sport eyewear and proprietary O-Matter frames" },
    { brandName: "Velocity", slug: "velocity", category: frameCategory?._id, description: "Contemporary urban fashion frames and blue-block collections" },
    { brandName: "Fastrack", slug: "fastrack", category: frameCategory?._id, description: "Trendy, youth-centric sunglasses and optical frames" },
    { brandName: "Titan Eyeplus", slug: "titan-eyeplus", category: frameCategory?._id, description: "High precision, reliable everyday eyewear frames" },
    { brandName: "Essilor", slug: "essilor", category: lensCategory?._id, description: "World leader in ophthalmic lenses, Crizal & Varilux" },
    { brandName: "Carl Zeiss", slug: "carl-zeiss", category: lensCategory?._id, description: "German precision optics, ClearView, and DuraVision coatings" },
    { brandName: "Hoya", slug: "hoya", category: lensCategory?._id, description: "Advanced Japanese optical glass and premium Hi-Vision coatings" },
    { brandName: "Bausch & Lomb", slug: "bausch-lomb", category: contactCategory?._id, description: "Global eye health pioneer, PureVision & Biotrue contact lenses" },
    { brandName: "Acuvue", slug: "acuvue", category: contactCategory?._id, description: "Johnson & Johnson breathable HydraLuxe contact lenses" },
  ];

  for (const b of brandsData) {
    if (!b.category) continue;
    const existing = await Brand.findOne({ slug: b.slug });
    if (!existing) {
      await Brand.create({
        brandName: b.brandName,
        slug: b.slug,
        category: b.category,
        description: b.description,
        isActive: true,
      });
      results.brandsAdded++;
    } else {
      results.brandsExisting++;
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

  for (const shape of frameShapesData) {
    const existing = await FrameShape.findOne({ slug: shape.slug });
    if (!existing) {
      await FrameShape.create({
        name: shape.name,
        slug: shape.slug,
        status: "active",
      });
      results.frameShapesAdded++;
    } else {
      results.frameShapesExisting++;
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

  for (const idx of lensIndicesData) {
    const existing = await LensIndex.findOne({ value: idx.value });
    if (!existing) {
      await LensIndex.create({
        value: idx.value,
        label: idx.label,
        status: "active",
      });
      results.lensIndicesAdded++;
    } else {
      results.lensIndicesExisting++;
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

  for (const lt of lensTypesData) {
    const existing = await LensType.findOne({ slug: lt.slug });
    if (!existing) {
      await LensType.create({
        name: lt.name,
        slug: lt.slug,
        status: "active",
      });
      results.lensTypesAdded++;
    } else {
      results.lensTypesExisting++;
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

  for (const bm of boxMaterialsData) {
    const existing = await BoxMaterial.findOne({ slug: bm.slug });
    if (!existing) {
      await BoxMaterial.create({
        name: bm.name,
        slug: bm.slug,
        status: "active",
      });
      results.boxMaterialsAdded++;
    } else {
      results.boxMaterialsExisting++;
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

  for (const bp of boxPrintsData) {
    const existing = await BoxPrint.findOne({ printName: bp.printName });
    if (!existing) {
      await BoxPrint.create({
        printName: bp.printName,
        status: "active",
      });
      results.boxPrintsAdded++;
    } else {
      results.boxPrintsExisting++;
    }
  }

  // 8. Default System Setting
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
      termsAndConditions: "1. Goods once sold can be exchanged within 7 days with original tax invoice.\n2. Customized power lenses cannot be cancelled once processed in the laboratory.\n3. Frame warranty covers manufacturing defects; physical damage or lens scratches are excluded.",
      whatsappNumber: "919876543210",
      notifyOnNewOrder: true,
      sendWhatsAppOrderAlert: true,
      sendWhatsAppBillAlert: true,
    });
    results.settingsInitialized = true;
  }

  return results;
}
