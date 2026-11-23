import Brand from "@/models/Brand";

export const getBrands = async () => {
  return await Brand.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();
};

export const getBrand = async (id: string) => {
  return await Brand.findById(id)
    .populate("category", "name slug")
    .lean();
};

export const createBrand = async (data: any) => {
  return await Brand.create(data);
};

export const updateBrand = async (
  id: string,
  data: any
) => {
  return await Brand.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("category", "name slug");
};

export const deleteBrand = async (id: string) => {
  return await Brand.findByIdAndDelete(id);
};