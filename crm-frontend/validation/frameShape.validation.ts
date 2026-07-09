export const validateFrameShape = (body: any) => {
  const { name, slug } = body;

  if (!name)
    return "Frame shape name is required";

  if (!slug)
    return "Slug is required";

  return null;
};