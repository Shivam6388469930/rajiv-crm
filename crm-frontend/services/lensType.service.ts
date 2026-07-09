// services/lensType.service.ts
import LensType from "@/models/LensType";

export async function getLensTypes() {
  try {
    const lensTypes = await LensType.find().sort({ createdAt: -1 });
    return lensTypes;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getLensType(id: string) {
  try {
    const lensType = await LensType.findById(id);
    if (!lensType) {
      throw new Error("Lens type not found");
    }
    return lensType;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createLensType(data: any) {
  try {
    const lensType = new LensType(data);
    await lensType.save();
    return lensType;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateLensType(id: string, data: any) {
  try {
    const lensType = await LensType.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!lensType) {
      throw new Error("Lens type not found");
    }
    return lensType;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteLensType(id: string) {
  try {
    const lensType = await LensType.findByIdAndDelete(id);
    if (!lensType) {
      throw new Error("Lens type not found");
    }
    return lensType;
  } catch (error: any) {
    throw new Error(error.message);
  }
}