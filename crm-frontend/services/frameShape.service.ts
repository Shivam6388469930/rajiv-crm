import FrameShape from "@/models/FrameShape";

export const getFrameShapes = async () => {
  return await FrameShape.find().sort({
    createdAt: -1,
  });
};

export const getFrameShape = async (
  id: string
) => {
  return await FrameShape.findById(id);
};

export const createFrameShape = async (
  data: any
) => {
  return await FrameShape.create(data);
};

export const updateFrameShape = async (
  id: string,
  data: any
) => {
  return await FrameShape.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteFrameShape = async (
  id: string
) => {
  return await FrameShape.findByIdAndDelete(id);
};