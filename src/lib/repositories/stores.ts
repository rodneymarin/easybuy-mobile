import type { SQLiteDatabase } from 'expo-sqlite';
import type { Store } from '@models/store.model';
import { getDatabase } from '@lib/database';

interface StoreRow {
  id: string;
  description: string;
  color: string;
}

function parseColor(value: string): number {
  const num = Number(value);
  if (!isNaN(num) && num >= 0 && num <= 8) return num;
  return 0;
}

export async function getAllStores(): Promise<Store[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StoreRow>("SELECT id, description, color FROM stores ORDER BY description");
  return rows.map((row) => ({ id: row.id, description: row.description, color: parseColor(row.color) }));
}

export async function createStore(id: string, description: string, color: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("INSERT INTO stores (id, description, color) VALUES (?, ?, ?)", [id, description, String(color)]);
}

export async function updateStore(id: string, description: string, color: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE stores SET description = ?, color = ? WHERE id = ?", [description, String(color), id]);
}

export async function deleteStore(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM product_prices WHERE store_id = ?", [id]);
  await db.runAsync("DELETE FROM stores WHERE id = ?", [id]);
}

export async function deleteStores(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`DELETE FROM product_prices WHERE store_id IN (${placeholders})`, ids);
  await db.runAsync(`DELETE FROM stores WHERE id IN (${placeholders})`, ids);
}
