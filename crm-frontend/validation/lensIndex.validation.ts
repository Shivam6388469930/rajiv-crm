// validation/lensIndex.validation.ts
export function validateLensIndex(data: any) {
  if (!data.value || data.value.trim().length === 0) {
    return "Value is required";
  }

  if (!/^\d+(\.\d+)?$/.test(data.value)) {
    return "Value must be a valid number";
  }

  if (!data.label || data.label.trim().length === 0) {
    return "Label is required";
  }

  if (data.label.length > 100) {
    return "Label must be less than 100 characters";
  }

  if (data.status && !["active", "inactive"].includes(data.status)) {
    return "Status must be either 'active' or 'inactive'";
  }

  return null;
}