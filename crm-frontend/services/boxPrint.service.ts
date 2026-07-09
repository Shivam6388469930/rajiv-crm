// services/boxPrint.service.ts
import BoxPrint from "@/models/BoxPrint";

export async function getBoxPrints() {
  try {
    const boxPrints = await BoxPrint.find().sort({ createdAt: -1 });
    return boxPrints;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getBoxPrint(id: string) {
  try {
    const boxPrint = await BoxPrint.findById(id);
    if (!boxPrint) {
      throw new Error("Box print not found");
    }
    return boxPrint;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createBoxPrint(data: any) {
  try {
    const boxPrint = new BoxPrint(data);
    await boxPrint.save();
    return boxPrint;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateBoxPrint(id: string, data: any) {
  try {
    const boxPrint = await BoxPrint.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!boxPrint) {
      throw new Error("Box print not found");
    }
    return boxPrint;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteBoxPrint(id: string) {
  try {
    const boxPrint = await BoxPrint.findByIdAndDelete(id);
    if (!boxPrint) {
      throw new Error("Box print not found");
    }
    return boxPrint;
  } catch (error: any) {
    throw new Error(error.message);
  }
}