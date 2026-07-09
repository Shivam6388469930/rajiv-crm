import Category from "@/models/Category";

export const getCategories = async () => {
    return await Category.find().sort({
        createdAt: -1,
    });
};

export const getCategory = async (id: string) => {
    return await Category.findById(id);
};

export const createCategory = async (data: any) => {
    return await Category.create(data);
};

export const updateCategory = async (
    id: string,
    data: any
) => {
    return await Category.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
        }
    );
};

export const deleteCategory = async (
    id: string
) => {
    return await Category.findByIdAndDelete(id);
};