import type { Database, SqlValue } from "sql.js";

const IDB_NAME = "velotech-local-database";
const IDB_STORE = "files";
const IDB_KEY = "velotech.sqlite";
const SCHEMA_VERSION = "1";

let database: Database | null = null;
let persistChain = Promise.resolve();

function openStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(IDB_STORE)) {
        request.result.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadFile(): Promise<Uint8Array | undefined> {
  const storage = await openStorage();

  return new Promise((resolve, reject) => {
    const transaction = storage.transaction(IDB_STORE, "readonly");
    const request = transaction.objectStore(IDB_STORE).get(IDB_KEY);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value instanceof Uint8Array ? value : value ? new Uint8Array(value) : undefined);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => storage.close();
  });
}

async function saveFile(bytes: Uint8Array): Promise<void> {
  const storage = await openStorage();

  await new Promise<void>((resolve, reject) => {
    const transaction = storage.transaction(IDB_STORE, "readwrite");
    transaction.objectStore(IDB_STORE).put(bytes, IDB_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  storage.close();
}

const SCHEMA = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS local_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    status TEXT NOT NULL DEFAULT 'active',
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS local_product_overrides (
    product_id TEXT PRIMARY KEY,
    stock_total INTEGER NOT NULL DEFAULT 50 CHECK(stock_total >= 0),
    stock_available INTEGER NOT NULL DEFAULT 50 CHECK(stock_available >= 0),
    max_per_user INTEGER NOT NULL DEFAULT 5 CHECK(max_per_user > 0),
    is_hidden INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    owner_key TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_json TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    updated_at TEXT NOT NULL,
    PRIMARY KEY (owner_key, product_id)
  );
  CREATE INDEX IF NOT EXISTS idx_cart_owner ON cart_items(owner_key);
  CREATE TABLE IF NOT EXISTS local_orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT,
    shipping_address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user_created ON local_orders(user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS local_order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES local_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    product_price REAL NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0)
  );
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON local_order_items(order_id);
  CREATE TABLE IF NOT EXISTS wishlist_items (
    product_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON product_reviews(product_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'local',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    email TEXT PRIMARY KEY COLLATE NOCASE,
    sync_status TEXT NOT NULL DEFAULT 'local',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chat_conversation_created ON chat_messages(conversation_id, created_at);
`;

function requireDatabase(): Database {
  if (!database) {
    throw new Error("Banco local ainda nao foi inicializado.");
  }
  return database;
}

function addColumnIfMissing(tableName: string, columnName: string, definition: string): void {
  const db = requireDatabase();
  const existingColumns = queryRows<{ name: string }>(`PRAGMA table_info(${tableName})`);

  if (existingColumns.some((column) => column.name === columnName)) {
    return;
  }

  db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function runLightweightMigrations(): void {
  addColumnIfMissing('local_users', 'role', "TEXT NOT NULL DEFAULT 'customer'");
  addColumnIfMissing('local_users', 'status', "TEXT NOT NULL DEFAULT 'active'");
  addColumnIfMissing('product_reviews', 'status', "TEXT NOT NULL DEFAULT 'approved'");
  requireDatabase().run(
    "UPDATE local_users SET role = 'admin', status = 'active' WHERE lower(email) = lower(?)",
    ['nunesnbnxn@gmail.com']
  );
}

function migrateLegacyLocalStorage(): void {
  const db = requireDatabase();
  if (db.exec("SELECT value FROM app_meta WHERE key = 'legacy_storage_migrated'").length > 0) return;

  try {
    const users = JSON.parse(localStorage.getItem('velotech:local-auth-users') || '[]') as Array<Record<string, unknown>>;
    for (const user of users) {
      db.run(
        `INSERT OR IGNORE INTO local_users(id, email, name, phone, address, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [Number(user.id), String(user.email), String(user.name), user.phone ? String(user.phone) : null,
          user.address ? String(user.address) : null, String(user.passwordHash), String(user.created_at)]
      );
    }

    const wishlist = JSON.parse(localStorage.getItem('velotech:wishlist') || '[]') as string[];
    for (const productId of wishlist) {
      db.run('INSERT OR IGNORE INTO wishlist_items(product_id, created_at) VALUES (?, ?)',
        [productId, new Date().toISOString()]);
    }

    const reviews = JSON.parse(localStorage.getItem('velotech:reviews') || '[]') as Array<Record<string, unknown>>;
    for (const review of reviews) {
      db.run(
        `INSERT OR IGNORE INTO product_reviews(id, product_id, name, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [String(review.id), String(review.productId), String(review.name), Number(review.rating),
          String(review.comment), String(review.createdAt)]
      );
    }

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('velotech:cart:')) {
        const items = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
        for (const item of items) {
          const { quantity, ...product } = item;
          db.run(
            `INSERT OR REPLACE INTO cart_items(owner_key, product_id, product_json, quantity, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [key, String(item.id), JSON.stringify(product), Number(quantity), new Date().toISOString()]
          );
        }
      }

      if (key?.startsWith('velotech:orders:')) {
        const userId = Number(key.slice('velotech:orders:'.length));
        const orders = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
        for (const order of orders) {
          db.run(
            `INSERT OR IGNORE INTO local_orders
             (id, user_id, total, status, payment_method, shipping_address, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [String(order.id), userId, Number(order.total), String(order.status),
              order.payment_method ? String(order.payment_method) : null,
              order.shipping_address ? String(order.shipping_address) : null,
              String(order.created_at), String(order.updated_at)]
          );
          for (const item of (order.items || []) as Array<Record<string, unknown>>) {
            db.run(
              `INSERT OR IGNORE INTO local_order_items
               (id, order_id, product_id, product_name, product_image, product_price, quantity)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [String(item.id), String(order.id), String(item.product_id), String(item.product_name),
                item.product_image ? String(item.product_image) : null, Number(item.product_price),
                Number(item.quantity)]
            );
          }
        }
      }
    }

    db.run("INSERT INTO app_meta(key, value) VALUES ('legacy_storage_migrated', ?)", [new Date().toISOString()]);
  } catch (error) {
    console.warn('Nao foi possivel migrar todos os dados locais antigos.', error);
  }
}

export async function initializeBrowserDatabase(): Promise<void> {
  if (database) return;

  const { default: initSqlJs } = await import('sql.js');
  const SQL = await initSqlJs({
    locateFile: () => `${import.meta.env.BASE_URL}sqlite/sql-wasm.wasm`,
  });

  let savedFile: Uint8Array | undefined;
  try {
    savedFile = await loadFile();
  } catch (error) {
    console.warn("IndexedDB indisponivel; SQLite funcionara somente nesta sessao.", error);
  }

  database = new SQL.Database(savedFile);
  database.run(SCHEMA);
  runLightweightMigrations();
  database.run("INSERT OR REPLACE INTO app_meta(key, value) VALUES (?, ?)", ["schema_version", SCHEMA_VERSION]);
  migrateLegacyLocalStorage();
  await persistBrowserDatabase();
}

export function queryRows<T>(sql: string, params: SqlValue[] = []): T[] {
  const statement = requireDatabase().prepare(sql, params);
  const rows: T[] = [];
  try {
    while (statement.step()) rows.push(statement.getAsObject() as T);
  } finally {
    statement.free();
  }
  return rows;
}

export function queryOne<T>(sql: string, params: SqlValue[] = []): T | null {
  return queryRows<T>(sql, params)[0] ?? null;
}

export function runStatement(sql: string, params: SqlValue[] = []): void {
  requireDatabase().run(sql, params);
}

export function runTransaction(action: () => void): void {
  const db = requireDatabase();
  db.run("BEGIN IMMEDIATE");
  try {
    action();
    db.run("COMMIT");
  } catch (error) {
    db.run("ROLLBACK");
    throw error;
  }
}

export function persistBrowserDatabase(): Promise<void> {
  if (!database) return Promise.resolve();
  const snapshot = database.export();
  persistChain = persistChain
    .catch(() => undefined)
    .then(() => saveFile(snapshot))
    .catch((error) => console.warn("Nao foi possivel persistir o SQLite local.", error));
  return persistChain;
}

export function newLocalId(prefix: string): string {
  const value = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}
