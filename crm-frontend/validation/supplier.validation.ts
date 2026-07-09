export const validateSupplier = (body: any) => {
  const {
    supplierName,
    email,
    phone,
  } = body;

  if (!supplierName)
    return "Supplier name is required";

  if (!email)
    return "Email is required";

  if (!phone)
    return "Phone is required";

  return null;
};