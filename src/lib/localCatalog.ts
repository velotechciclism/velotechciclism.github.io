import { brands as baseBrands, categories as baseCategories, products } from '@/data/products';
import type { Product } from '@/types/product';
import {
  newLocalId,
  persistBrowserDatabase,
  queryOne,
  queryRows,
  runStatement,
  runTransaction,
} from './browserDatabase';

export type ProductOverride = {
  product_id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
  price: number | null;
  image: string | null;
  is_custom: number;
  stock_total: number;
  stock_available: number;
  max_per_user: number;
  is_hidden: number;
  updated_at: string;
};

export type EditableProductInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  stockTotal: number;
  stockAvailable: number;
  maxPerUser: number;
  isHidden?: boolean;
};

const DEFAULT_STOCK = 50;
const DEFAULT_MAX_PER_USER = 5;

function defaultOverride(productId: string): ProductOverride {
  return {
    product_id: productId,
    name: null,
    description: null,
    category: null,
    brand: null,
    price: null,
    image: null,
    is_custom: 0,
    stock_total: DEFAULT_STOCK,
    stock_available: DEFAULT_STOCK,
    max_per_user: DEFAULT_MAX_PER_USER,
    is_hidden: 0,
    updated_at: new Date().toISOString(),
  };
}

function normalizeNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function productFromCustomOverride(override: ProductOverride): Product {
  return {
    id: override.product_id,
    name: override.name || 'Produto sem nome',
    description: override.description || 'Produto cadastrado pelo administrador.',
    price: override.price || 0,
    image: override.image || '/placeholder.svg',
    category: override.category || 'Acessórios',
    brand: override.brand || 'VeloTech',
    rating: 0,
    reviewCount: 0,
    inStock: override.stock_available > 0 && !override.is_hidden,
    stockTotal: override.stock_total,
    stockAvailable: override.stock_available,
    maxPerUser: override.max_per_user,
    isHidden: Boolean(override.is_hidden),
    isNew: true,
  };
}

export function readProductOverrides(): ProductOverride[] {
  return queryRows<ProductOverride>(
    `SELECT product_id, name, description, category, brand, price, image, is_custom,
            stock_total, stock_available, max_per_user, is_hidden, updated_at
       FROM local_product_overrides`
  );
}

export function readProductOverride(productId: string): ProductOverride {
  return queryOne<ProductOverride>(
    `SELECT product_id, name, description, category, brand, price, image, is_custom,
            stock_total, stock_available, max_per_user, is_hidden, updated_at
       FROM local_product_overrides WHERE product_id = ?`,
    [productId]
  ) || defaultOverride(productId);
}

export function mergeProductOverride(product: Product, override = readProductOverride(product.id)): Product {
  return {
    ...product,
    name: override.name || product.name,
    description: override.description || product.description,
    category: override.category || product.category,
    brand: override.brand || product.brand,
    price: override.price ?? product.price,
    image: override.image || product.image,
    stockTotal: override.stock_total,
    stockAvailable: override.stock_available,
    maxPerUser: override.max_per_user,
    isHidden: Boolean(override.is_hidden),
    inStock: product.inStock && override.stock_available > 0 && !override.is_hidden,
  };
}

export function getCatalogProducts(options: { includeHidden?: boolean } = {}): Product[] {
  const overridesByProduct = new Map(readProductOverrides().map((override) => [override.product_id, override]));
  const baseProductIds = new Set(products.map((product) => product.id));
  const mergedBaseProducts = products.map((product) => mergeProductOverride(product, overridesByProduct.get(product.id)));
  const customProducts = [...overridesByProduct.values()]
    .filter((override) => override.is_custom && !baseProductIds.has(override.product_id))
    .map(productFromCustomOverride);
  const mergedProducts = [...mergedBaseProducts, ...customProducts];

  return options.includeHidden ? mergedProducts : mergedProducts.filter((product) => !product.isHidden);
}

export function getCatalogProduct(productId: string, options: { includeHidden?: boolean } = {}): Product | undefined {
  const baseProduct = products.find((item) => item.id === productId);
  const override = readProductOverride(productId);
  const product = baseProduct ? mergeProductOverride(baseProduct, override) : override.is_custom ? productFromCustomOverride(override) : undefined;

  if (!product) return undefined;
  return !options.includeHidden && product.isHidden ? undefined : product;
}

export async function updateProductInventory(
  productId: string,
  values: { stockTotal: number; stockAvailable: number; maxPerUser: number; isHidden: boolean },
  reason = 'Atualização manual do administrador'
): Promise<void> {
  const previous = readProductOverride(productId);
  const stockTotal = Math.max(0, Math.floor(values.stockTotal));
  const stockAvailable = Math.max(0, Math.min(stockTotal, Math.floor(values.stockAvailable)));
  const maxPerUser = Math.max(1, Math.floor(values.maxPerUser));
  const now = new Date().toISOString();

  runTransaction(() => {
    runStatement(
      `INSERT INTO local_product_overrides(product_id, stock_total, stock_available, max_per_user, is_hidden, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(product_id) DO UPDATE SET
         stock_total = excluded.stock_total,
         stock_available = excluded.stock_available,
         max_per_user = excluded.max_per_user,
         is_hidden = excluded.is_hidden,
         updated_at = excluded.updated_at`,
      [productId, stockTotal, stockAvailable, maxPerUser, values.isHidden ? 1 : 0, now]
    );
    runStatement(
      `INSERT INTO stock_history(id, product_id, previous_total, previous_available, next_total, next_available, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLocalId('stock'), productId, previous.stock_total, previous.stock_available, stockTotal, stockAvailable, reason, now]
    );
  });

  await persistBrowserDatabase();
}

export async function saveEditableProduct(input: EditableProductInput): Promise<string> {
  const now = new Date().toISOString();
  const productId = input.id || newLocalId('product');
  const stockTotal = Math.max(0, Math.floor(normalizeNumber(input.stockTotal, DEFAULT_STOCK)));
  const stockAvailable = Math.max(0, Math.min(stockTotal, Math.floor(normalizeNumber(input.stockAvailable, stockTotal))));
  const maxPerUser = Math.max(1, Math.floor(normalizeNumber(input.maxPerUser, DEFAULT_MAX_PER_USER)));
  const existing = readProductOverride(productId);

  runTransaction(() => {
    runStatement(
      `INSERT INTO local_product_overrides
       (product_id, name, description, category, brand, price, image, is_custom,
        stock_total, stock_available, max_per_user, is_hidden, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(product_id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         category = excluded.category,
         brand = excluded.brand,
         price = excluded.price,
         image = excluded.image,
         is_custom = CASE WHEN local_product_overrides.is_custom = 1 THEN 1 ELSE excluded.is_custom END,
         stock_total = excluded.stock_total,
         stock_available = excluded.stock_available,
         max_per_user = excluded.max_per_user,
         is_hidden = excluded.is_hidden,
         updated_at = excluded.updated_at`,
      [
        productId,
        input.name.trim(),
        input.description.trim(),
        input.category.trim(),
        input.brand.trim(),
        normalizeNumber(Number(input.price), 0),
        input.image.trim() || '/placeholder.svg',
        products.some((product) => product.id === productId) ? 0 : 1,
        stockTotal,
        stockAvailable,
        maxPerUser,
        input.isHidden ? 1 : 0,
        now,
      ]
    );
    runStatement(
      `INSERT INTO stock_history(id, product_id, previous_total, previous_available, next_total, next_available, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLocalId('stock'), productId, existing.stock_total, existing.stock_available, stockTotal, stockAvailable,
        input.id ? 'Edição completa do produto' : 'Produto criado pelo administrador', now]
    );
  });

  await ensureLocalCategory(input.category);
  await ensureLocalBrand(input.brand);
  await persistBrowserDatabase();
  return productId;
}

export async function hideProduct(productId: string): Promise<void> {
  const product = getCatalogProduct(productId, { includeHidden: true });
  if (!product) return;

  await saveEditableProduct({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    price: product.price,
    image: product.image,
    stockTotal: product.stockTotal || DEFAULT_STOCK,
    stockAvailable: product.stockAvailable || 0,
    maxPerUser: product.maxPerUser || DEFAULT_MAX_PER_USER,
    isHidden: true,
  });
}

export async function ensureLocalCategory(name: string): Promise<void> {
  const normalized = name.trim();
  if (!normalized) return;
  runStatement('INSERT OR IGNORE INTO local_categories(name, created_at) VALUES (?, ?)', [normalized, new Date().toISOString()]);
  await persistBrowserDatabase();
}

export async function removeLocalCategory(name: string): Promise<void> {
  runStatement('DELETE FROM local_categories WHERE name = ? COLLATE NOCASE', [name.trim()]);
  await persistBrowserDatabase();
}

export async function ensureLocalBrand(name: string): Promise<void> {
  const normalized = name.trim();
  if (!normalized) return;
  runStatement('INSERT OR IGNORE INTO local_brands(name, created_at) VALUES (?, ?)', [normalized, new Date().toISOString()]);
  await persistBrowserDatabase();
}

export async function removeLocalBrand(name: string): Promise<void> {
  runStatement('DELETE FROM local_brands WHERE name = ? COLLATE NOCASE', [name.trim()]);
  await persistBrowserDatabase();
}

export function getManagedCategories(): string[] {
  const local = queryRows<{ name: string }>('SELECT name FROM local_categories ORDER BY name').map((row) => row.name);
  return [...new Set([...baseCategories.map((category) => category.name), ...local])].sort();
}

export function getManagedBrands(): string[] {
  const local = queryRows<{ name: string }>('SELECT name FROM local_brands ORDER BY name').map((row) => row.name);
  return [...new Set([...baseBrands, ...local])].sort();
}
