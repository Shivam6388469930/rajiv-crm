import Customer from "@/models/Customer";

export const getCustomers = async () => {
  return await Customer.find().sort({
    createdAt: -1,
  }).lean();
};

export const getCustomer = async (
  id: string
) => {
  return await Customer.findById(id).lean();
};

export const createCustomer = async (
  data: any
) => {
  return await Customer.create(data);
};

export const updateCustomer = async (
  id: string,
  data: any
) => {
  return await Customer.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteCustomer = async (
  id: string
) => {
  return await Customer.findByIdAndDelete(id);
};