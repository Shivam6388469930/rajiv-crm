// services/lensIndex.service.ts
import LensIndex from "@/models/LensIndex";

export async function getLensIndices() {
  try {
    const lensIndices = await LensIndex.find().sort({ value: 1 });
    return lensIndices;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getLensIndex(id: string) {
  try {
    const lensIndex = await LensIndex.findById(id);
    if (!lensIndex) {
      throw new Error("Lens index not found");
    }
    return lensIndex;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getLensIndexByValue(value: string) {
  try {
    const lensIndex = await LensIndex.findOne({ value });
    return lensIndex;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createLensIndex(data: any) {
  try {
    // Check if value already exists
    const existing = await LensIndex.findOne({ value: data.value });
    if (existing) {
      throw new Error("Lens index value already exists");
    }

    const lensIndex = new LensIndex(data);
    await lensIndex.save();
    return lensIndex;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateLensIndex(id: string, data: any) {
  try {
    // If updating value, check if new value already exists
    if (data.value) {
      const existing = await LensIndex.findOne({ 
        value: data.value,
        _id: { $ne: id }
      });
      if (existing) {
        throw new Error("Lens index value already exists");
      }
    }

    const lensIndex = await LensIndex.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!lensIndex) {
      throw new Error("Lens index not found");
    }
    return lensIndex;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteLensIndex(id: string) {
  try {
    const lensIndex = await LensIndex.findByIdAndDelete(id);
    if (!lensIndex) {
      throw new Error("Lens index not found");
    }
    return lensIndex;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function seedLensIndices(indices: any[]) {
  try {
    for (const index of indices) {
      const existing = await LensIndex.findOne({ value: index.value });
      if (!existing) {
        await LensIndex.create(index);
      }
    }
    return await LensIndex.find().sort({ value: 1 });
  } catch (error: any) {
    throw new Error(error.message);
  }
}