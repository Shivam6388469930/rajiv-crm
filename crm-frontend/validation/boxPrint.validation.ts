// validation/boxPrint.validation.ts
export function validateBoxPrint(data: any) {
  if (!data.printName || data.printName.trim().length === 0) {
    return "Print name is required";
  }

  if (data.printName.length > 100) {
    return "Print name must be less than 100 characters";
  }

  if (data.status && !["active", "inactive"].includes(data.status)) {
    return "Status must be either 'active' or 'inactive'";
  }

  return null;
}