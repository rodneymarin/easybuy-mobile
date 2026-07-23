import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { seedIfEmpty } from '@lib/seed';

let db: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync('easybuy.db');
      await runMigrations(db);
      await seedIfEmpty(db);
      return db;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '0'
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      unit_of_measurement TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_prices (
      product_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      value REAL NOT NULL,
      PRIMARY KEY (product_id, store_id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS shopping_lists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shopping_list_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      store_id TEXT,
      quantity REAL NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    await database.execAsync("ALTER TABLE stores ADD COLUMN color TEXT NOT NULL DEFAULT '0'");
  } catch {
    // Column already exists — ignore
  }

  try {
    await database.execAsync("ALTER TABLE shopping_list_items ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0");
  } catch {
    // Column already exists — ignore
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM shopping_list_items;
    DELETE FROM shopping_lists;
    DELETE FROM product_prices;
    DELETE FROM products;
    DELETE FROM stores;
  `);
  await seedIfEmpty(database);
}
