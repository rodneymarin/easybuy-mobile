import type { SQLiteDatabase } from 'expo-sqlite';
import type { Store } from '@models/store.model';
import { getDatabase } from '../database';

interface StoreRow {
  id: string;
  description: string;
}

export async function getAllStores(): Promise<Store[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StoreRow>("SELECT id, description FROM stores ORDER BY description");
  return rows.map((row) => ({ id: row.id, description: row.description }));
}
