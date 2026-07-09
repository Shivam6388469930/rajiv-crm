export interface Subcategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
  isActive?: boolean;
}

const BASE_URL = "/api/categories";

const mapCategory = (category: any): Category => ({
  ...category,
  id: category._id,
  subcategories: (category.subcategories || []).map((sub: any) => ({
    ...sub,
    id: sub._id,
  })),
});

export async function getCategories() {
  try {
    const res = await fetch(BASE_URL);

    const json = await res.json();

    return {
      success: json.success,
      message: json.message,
      data: (json.data || []).map(mapCategory),
    };
  } catch {
    return {
      success: false,
      message: "Unable to load categories",
    };
  }
}

export async function createCategory(data: any) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  return {
    success: json.success,
    message: json.message,
    data: json.data ? mapCategory(json.data) : null,
  };
}

export async function updateCategory(
  id: string,
  data: any
) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  return {
    success: json.success,
    message: json.message,
    data: json.data ? mapCategory(json.data) : null,
  };
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  return await res.json();
}

export async function addSubcategory(
  category: Category,
  subcategory: any
) {
  const updated = {
    ...category,
    subcategories: [
      ...category.subcategories,
      subcategory,
    ],
  };

  return updateCategory(category.id, updated);
}

export async function editSubcategory(
  category: Category,
  subId: string,
  subcategory: any
) {
  const updated = {
    ...category,
    subcategories: category.subcategories.map((sub) =>
      sub.id === subId
        ? {
            ...sub,
            ...subcategory,
          }
        : sub
    ),
  };

  return updateCategory(category.id, updated);
}

export async function removeSubcategory(
  category: Category,
  subId: string
) {
  const updated = {
    ...category,
    subcategories: category.subcategories.filter(
      (sub) => sub.id !== subId
    ),
  };

  return updateCategory(category.id, updated);
}