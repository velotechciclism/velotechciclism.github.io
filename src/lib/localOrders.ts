import type { CartItem } from '@/types/product';

const LOCAL_ORDERS_PREFIX = 'velotech:orders:';

export interface LocalOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
}

export interface LocalOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  items: LocalOrderItem[];
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getOrdersKey(userId: number): string {
  return `${LOCAL_ORDERS_PREFIX}${userId}`;
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();

  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  const storage = getStorage();

  if (!storage) {
    throw new Error('Armazenamento local indisponivel neste navegador.');
  }

  storage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string): string {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomId}`;
}

function getPromoDiscountRate(promoCode: string | undefined, subtotal: number): number {
  const normalizedCode = promoCode?.trim().toUpperCase();

  if (normalizedCode === 'VELO10') {
    return 0.1;
  }

  if (normalizedCode === 'BIKE15' && subtotal >= 100) {
    return 0.15;
  }

  return 0;
}

export function getLocalOrders(userId: number): LocalOrder[] {
  return readJson<LocalOrder[]>(getOrdersKey(userId), []);
}

export function createLocalOrder(
  userId: number,
  items: CartItem[],
  paymentMethod: string,
  shippingAddress: string,
  promoCode?: string
): { id: string } {
  const now = new Date().toISOString();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.23;
  const discount = Number((subtotal * getPromoDiscountRate(promoCode, subtotal)).toFixed(2));
  const total = subtotal + shippingCost + tax - discount;

  const order: LocalOrder = {
    id: createId('local-order'),
    user_id: String(userId),
    total,
    status: 'pending',
    payment_method: paymentMethod,
    shipping_address: shippingAddress,
    created_at: now,
    updated_at: now,
    items: items.map((item) => ({
      id: createId('local-item'),
      product_id: item.id,
      product_name: item.name,
      product_image: item.image || null,
      product_price: item.price,
      quantity: item.quantity,
    })),
  };

  writeJson(getOrdersKey(userId), [order, ...getLocalOrders(userId)]);

  return { id: order.id };
}
