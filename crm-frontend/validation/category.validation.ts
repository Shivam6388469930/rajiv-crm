export const validateCategory = (body: any) => {
    const { name, slug } = body;

    if (!name)
        return "Category name is required";

    if (!slug)
        return "Slug is required";

    return null;
};