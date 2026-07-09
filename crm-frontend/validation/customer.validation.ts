export const validateCustomer = (body: any) => {
  const { name, email, phone } = body;

  if (!name)
    return "Customer name is required";

  if (!email)
    return "Email is required";

  if (!phone)
    return "Phone is required";

  return null;
};