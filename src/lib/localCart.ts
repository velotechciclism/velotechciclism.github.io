import type { CartItem } from '@/types/product';
import { persistBrowserDatabase, queryRows, runStatement, runTransaction } from './browserDatabase';

type CartRow = { product_json: string; quantity: number };

export function readLocalCart(ownerKey: string): CartItem[] {
  return queryRows<CartRow>(
    'SELECT product_json, quantity FROM cart_items WHERE owner_key = ? ORDER BY updated_at',
    [ownerKey]
  ).flatMap((row) => {
    try {
      return [{ ...(JSON.parse(row.product_json) as CartItem), quantity: row.quantity }];
    } catch {
      return [];
    }
  });
}

export async function writeLocalCart(ownerKey: string, items: CartItem[]): Promise<void> {
  const now = new Date().toISOString();
  runTransaction(() => {
    runStatement('DELETE FROM cart_items WHERE owner_key = ?', [ownerKey]);
    for (const item of items) {
      const { quantity: _quantity, ...product } = item;
      runStatement(
        `INSERT INTO cart_items(owner_key, product_id, product_json, quantity, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [ownerKey, item.id, JSON.stringify(product), item.quantity, now]
      );
    }
  });
  await persistBrowserDatabase();
}
