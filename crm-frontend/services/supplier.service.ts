import Supplier from "@/models/Supplier";

export const getSuppliers = async () => {
  return await Supplier.find().sort({
    createdAt: -1,
  }).lean();
};

export const getSupplier = async (
  id: string
) => {
  return await Supplier.findById(id).lean();
};

export const createSupplier = async (
  data: any
) => {
  return await Supplier.create(data);
};

export const updateSupplier = async (
  id: string,
  data: any
) => {
  return await Supplier.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteSupplier = async (
  id: string
) => {
  return await Supplier.findByIdAndDelete(id);
};