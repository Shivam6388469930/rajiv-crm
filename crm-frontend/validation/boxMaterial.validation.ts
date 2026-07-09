// validation/boxMaterial.validation.ts
export function validateBoxMaterial(data: any) {
  if (!data.name || data.name.trim().length === 0) {
    return "Name is required";
  }

  if (data.name.length > 100) {
    return "Name must be less than 100 characters";
  }

  if (!data.slug || data.slug.trim().length === 0) {
    return "Slug is required";
  }

  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    return "Slug can only contain lowercase letters, numbers, and hyphens";
  }

  if (data.status && !["active", "inactive"].includes(data.status)) {
    return "Status must be either 'active' or 'inactive'";
  }

  return null;
}