// lib/customerCart.ts

export interface CartItem {
  id: string; // unique item cart key: `${productId}-${color || 'default'}-${quality || 'default'}`
  product_id: string;
  name: string;
  sku: string;
  price: number;
  color?: string;
  quality?: string;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
}

const CART_STORAGE_KEY = "optic_crm_customer_cart";
const CUSTOMER_INFO_KEY = "optic_crm_customer_info";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

export function addToCart(item: Omit<CartItem, "id">): void {
  const items = getCartItems();
  const id = `${item.product_id}-${item.color || "def"}-${item.quality || "std"}`;

  const existingIndex = items.findIndex((i) => i.id === id);
  if (existingIndex > -1) {
    const newQty = items[existingIndex].quantity + item.quantity;
    items[existingIndex].quantity = Math.min(newQty, item.maxStock || 9999);
  } else {
    items.push({
      ...item,
      id,
    });
  }

  saveCartItems(items);
}

export function removeFromCart(id: string): void {
  const items = getCartItems().filter((i) => i.id !== id);
  saveCartItems(items);
}

export function updateCartQuantity(id: string, qty: number): void {
  const items = getCartItems().map((i) => {
    if (i.id === id) {
      return {
        ...i,
        quantity: Math.max(1, Math.min(qty, i.maxStock || 9999)),
      };
    }
    return i;
  });
  saveCartItems(items);
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getSavedCustomerInfo() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomerInfo(info: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(info));
  } catch (e) {
    console.error("Failed to save customer info:", e);
  }
}
