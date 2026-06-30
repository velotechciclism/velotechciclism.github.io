import { products } from '@/data/products';
import type { Product } from '@/types/product';
import { persistBrowserDatabase, queryOne, queryRows, runStatement } from './browserDatabase';

export type ProductOverride = {
  product_id: string;
  stock_total: number;
  stock_available: number;
  max_per_user: number;
  is_hidden: number;
  updated_at: string;
};

const DEFAULT_STOCK = 50;
const DEFAULT_MAX_PER_USER = 5;

function defaultOverride(productId: string): ProductOverride {
  return {
    product_id: productId,
    stock_total: DEFAULT_STOCK,
    stock_available: DEFAULT_STOCK,
    max_per_user: DEFAULT_MAX_PER_USER,
    is_hidden: 0,
    updated_at: new Date().toISOString(),
  };
}

export function readProductOverrides(): ProductOverride[] {
  return queryRows<ProductOverride>(
    `SELECT product_id, stock_total, stock_available, max_per_user, is_hidden, updated_at
       FROM local_product_overrides`
  );
}

export function readProductOverride(productId: string): ProductOverride {
  return queryOne<ProductOverride>(
    `SELECT product_id, stock_total, stock_available, max_per_user, is_hidden, updated_at
       FROM local_product_overrides WHERE product_id = ?`,
    [productId]
  ) || defaultOverride(productId);
}

export function mergeProductOverride(product: Product, override = readProductOverride(product.id)): Product {
  return {
    ...product,
    stockTotal: override.stock_total,
    stockAvailable: override.stock_available,
    maxPerUser: override.max_per_user,
    isHidden: Boolean(override.is_hidden),
    inStock: product.inStock && override.stock_available > 0 && !override.is_hidden,
  };
}

export function getCatalogProducts(options: { includeHidden?: boolean } = {}): Product[] {
  const overridesByProduct = new Map(readProductOverrides().map((override) => [override.product_id, override]));
  const mergedProducts = products.map((product) => mergeProductOverride(product, overridesByProduct.get(product.id)));

  return options.includeHidden ? mergedProducts : mergedProducts.filter((product) => !product.isHidden);
}

export function getCatalogProduct(productId: string, options: { includeHidden?: boolean } = {}): Product | undefined {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return undefined;
  }

  const mergedProduct = mergeProductOverride(product);
  return !options.includeHidden && mergedProduct.isHidden ? undefined : mergedProduct;
}

export async function updateProductInventory(
  productId: string,
  values: { stockTotal: number; stockAvailable: number; maxPerUser: number; isHidden: boolean }
): Promise<void> {
  const stockTotal = Math.max(0, Math.floor(values.stockTotal));
  const stockAvailable = Math.max(0, Math.min(stockTotal, Math.floor(values.stockAvailable)));
  const maxPerUser = Math.max(1, Math.floor(values.maxPerUser));

  runStatement(
    `INSERT INTO local_product_overrides(product_id, stock_total, stock_available, max_per_user, is_hidden, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id) DO UPDATE SET
       stock_total = excluded.stock_total,
       stock_available = excluded.stock_available,
       max_per_user = excluded.max_per_user,
       is_hidden = excluded.is_hidden,
       updated_at = excluded.updated_at`,
    [productId, stockTotal, stockAvailable, maxPerUser, values.isHidden ? 1 : 0, new Date().toISOString()]
  );

  await persistBrowserDatabase();
}

