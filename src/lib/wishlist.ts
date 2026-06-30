import { persistBrowserDatabase, queryOne, queryRows, runStatement } from './browserDatabase';

export function readWishlistIds(): string[] {
  return queryRows<{ product_id: string }>(
    'SELECT product_id FROM wishlist_items ORDER BY created_at DESC'
  ).map((row) => row.product_id);
}

export function isInWishlist(productId: string): boolean {
  return Boolean(queryOne('SELECT 1 FROM wishlist_items WHERE product_id = ?', [productId]));
}

export function addToWishlist(productId: string) {
  runStatement(
    'INSERT OR IGNORE INTO wishlist_items(product_id, created_at) VALUES (?, ?)',
    [productId, new Date().toISOString()]
  );
  void persistBrowserDatabase();
}

export function removeFromWishlist(productId: string) {
  runStatement('DELETE FROM wishlist_items WHERE product_id = ?', [productId]);
  void persistBrowserDatabase();
}

export function toggleWishlist(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  }

  addToWishlist(productId);
  return true;
}
