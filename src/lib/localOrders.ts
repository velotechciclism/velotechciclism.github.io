import type { CartItem } from '@/types/product';
import {
  newLocalId,
  persistBrowserDatabase,
  queryRows,
  runStatement,
  runTransaction,
} from '@/lib/browserDatabase';

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

type OrderRow = Omit<LocalOrder, 'items'>;

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
  const orders = queryRows<OrderRow>(
    `SELECT id, CAST(user_id AS TEXT) AS user_id, total, status, payment_method,
            shipping_address, created_at, updated_at
       FROM local_orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return orders.map((order) => ({
    ...order,
    items: queryRows<LocalOrderItem>(
      `SELECT id, product_id, product_name, product_image, product_price, quantity
         FROM local_order_items WHERE order_id = ?`,
      [order.id]
    ),
  }));
}

export function createLocalOrder(
  userId: number,
  items: CartItem[],
  paymentMethod: string,
  shippingAddress: string,
  promoCode?: string
): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.23;
  const discount = Number((subtotal * getPromoDiscountRate(promoCode, subtotal)).toFixed(2));
  const total = subtotal + shippingCost + tax - discount;

  const order: LocalOrder = {
    id: newLocalId('local-order'),
    user_id: String(userId),
    total,
    status: 'pending',
    payment_method: paymentMethod,
    shipping_address: shippingAddress,
    created_at: now,
    updated_at: now,
    items: items.map((item) => ({
      id: newLocalId('local-item'),
      product_id: item.id,
      product_name: item.name,
      product_image: item.image || null,
      product_price: item.price,
      quantity: item.quantity,
    })),
  };

  runTransaction(() => {
    runStatement(
      `INSERT INTO local_orders
       (id, user_id, total, status, payment_method, shipping_address, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.id, userId, order.total, order.status, order.payment_method,
        order.shipping_address, order.created_at, order.updated_at]
    );
    for (const item of order.items) {
      runStatement(
        `INSERT INTO local_order_items
         (id, order_id, product_id, product_name, product_image, product_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.id, order.id, item.product_id, item.product_name, item.product_image,
          item.product_price, item.quantity]
      );
    }
  });

  return persistBrowserDatabase().then(() => ({ id: order.id }));
}
