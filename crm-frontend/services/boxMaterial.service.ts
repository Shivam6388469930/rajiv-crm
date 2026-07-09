// services/boxMaterial.service.ts
import BoxMaterial from "@/models/BoxMaterial";

export async function getBoxMaterials() {
  try {
    const boxMaterials = await BoxMaterial.find().sort({ createdAt: -1 });
    return boxMaterials;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getBoxMaterial(id: string) {
  try {
    const boxMaterial = await BoxMaterial.findById(id);
    if (!boxMaterial) {
      throw new Error("Box material not found");
    }
    return boxMaterial;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getBoxMaterialBySlug(slug: string) {
  try {
    const boxMaterial = await BoxMaterial.findOne({ slug });
    return boxMaterial;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createBoxMaterial(data: any) {
  try {
    // Check if slug already exists
    const existing = await BoxMaterial.findOne({ slug: data.slug });
    if (existing) {
      throw new Error("Box material with this slug already exists");
    }

    const boxMaterial = new BoxMaterial(data);
    await boxMaterial.save();
    return boxMaterial;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateBoxMaterial(id: string, data: any) {
  try {
    // If updating slug, check if new slug already exists
    if (data.slug) {
      const existing = await BoxMaterial.findOne({ 
        slug: data.slug,
        _id: { $ne: id }
      });
      if (existing) {
        throw new Error("Box material with this slug already exists");
      }
    }

    const boxMaterial = await BoxMaterial.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!boxMaterial) {
      throw new Error("Box material not found");
    }
    return boxMaterial;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteBoxMaterial(id: string) {
  try {
    const boxMaterial = await BoxMaterial.findByIdAndDelete(id);
    if (!boxMaterial) {
      throw new Error("Box material not found");
    }
    return boxMaterial;
  } catch (error: any) {
    throw new Error(error.message);
  }
}