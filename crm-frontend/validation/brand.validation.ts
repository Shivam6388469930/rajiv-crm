export const validateBrand = (body: any) => {
  const { category, brandName, slug } = body;

  if (!category)
    return "Category is required";

  if (!brandName)
    return "Brand name is required";

  if (!slug)
    return "Slug is required";

  return null;
};