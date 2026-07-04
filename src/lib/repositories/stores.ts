import type { SQLiteDatabase } from 'expo-sqlite';
import type { Store } from '@models/store.model';
import { getDatabase } from '@lib/database';

interface StoreRow {
  id: string;
  description: string;
}

export async function getAllStores(): Promise<Store[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StoreRow>("SELECT id, description FROM stores ORDER BY description");
  return rows.map((row) => ({ id: row.id, description: row.description }));
}

export async function createStore(id: string, description: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("INSERT INTO stores (id, description) VALUES (?, ?)", [id, description]);
}

export async function updateStore(id: string, description: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE stores SET description = ? WHERE id = ?", [description, id]);
}

export async function deleteStore(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM product_prices WHERE store_id = ?", [id]);
  await db.runAsync("DELETE FROM stores WHERE id = ?", [id]);
}
