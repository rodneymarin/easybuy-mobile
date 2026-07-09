import type { ShoppingList } from '@models/shopping-list.model';
import type { ShoppingListItem } from '@models/shopping-list-item.model';
import { getDatabase } from '@lib/database';

interface ListRow {
  id: string;
  title: string;
}

interface ItemRow {
  id: number;
  shopping_list_id: string;
  product_id: string;
  store_id: string | null;
  quantity: number;
  done: number;
  pinned: number;
}

function mapItem(row: ItemRow): ShoppingListItem {
  return {
    rowId: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    storeId: row.store_id ?? undefined,
    done: row.done === 1,
    pinned: row.pinned === 1,
  };
}

export async function getAllShoppingLists(): Promise<ShoppingList[]> {
  const db = await getDatabase();
  const lists = await db.getAllAsync<ListRow>("SELECT id, title FROM shopping_lists ORDER BY title");
  const items = await db.getAllAsync<ItemRow>("SELECT * FROM shopping_list_items");

  return lists.map((l) => ({
    id: l.id,
    title: l.title,
    items: items.filter((i) => i.shopping_list_id === l.id).map(mapItem),
  }));
}

export async function getShoppingListById(id: string): Promise<ShoppingList | null> {
  const db = await getDatabase();
  const list = await db.getFirstAsync<ListRow>("SELECT id, title FROM shopping_lists WHERE id = ?", [id]);
  if (!list) return null;

  const items = await db.getAllAsync<ItemRow>("SELECT * FROM shopping_list_items WHERE shopping_list_id = ?", [id]);

  return {
    id: list.id,
    title: list.title,
    items: items.map(mapItem),
  };
}

export async function createShoppingList(id: string, title: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("INSERT INTO shopping_lists (id, title) VALUES (?, ?)", [id, title]);
}

export async function deleteShoppingList(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM shopping_list_items WHERE shopping_list_id = ?", [id]);
  await db.runAsync("DELETE FROM shopping_lists WHERE id = ?", [id]);
}

export async function addItemToList(
  shoppingListId: string,
  item: Omit<ShoppingListItem, "done" | "rowId"> & { done?: boolean }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO shopping_list_items (shopping_list_id, product_id, store_id, quantity, done) VALUES (?, ?, ?, ?, ?)",
    [shoppingListId, item.productId, item.storeId ?? null, item.quantity, item.done ? 1 : 0]
  );
}

export async function toggleItemDone(itemRowId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE shopping_list_items SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END WHERE id = ?",
    [itemRowId]
  );
}

export async function updateShoppingListTitle(id: string, title: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE shopping_lists SET title = ? WHERE id = ?", [title, id]);
}

export async function updateItemInList(rowId: number, productId: string, quantity: number, storeId?: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE shopping_list_items SET product_id = ?, store_id = ?, quantity = ? WHERE id = ?",
    [productId, storeId ?? null, quantity, rowId]
  );
}

export async function removeItemFromList(itemRowId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM shopping_list_items WHERE id = ?", [itemRowId]);
}

export async function removeItemsFromList(itemRowIds: number[]): Promise<void> {
  if (itemRowIds.length === 0) return;
  const db = await getDatabase();
  const placeholders = itemRowIds.map(() => '?').join(',');
  await db.runAsync(`DELETE FROM shopping_list_items WHERE id IN (${placeholders})`, itemRowIds);
}

export async function moveItemsToList(itemRowIds: number[], targetListId: string): Promise<void> {
  if (itemRowIds.length === 0) return;
  const db = await getDatabase();
  const placeholders = itemRowIds.map(() => '?').join(',');
  await db.runAsync(`UPDATE shopping_list_items SET shopping_list_id = ? WHERE id IN (${placeholders})`, [targetListId, ...itemRowIds]);
}

export async function pinItems(itemRowIds: number[], pinned: boolean): Promise<void> {
  if (itemRowIds.length === 0) return;
  const db = await getDatabase();
  const placeholders = itemRowIds.map(() => '?').join(',');
  await db.runAsync(`UPDATE shopping_list_items SET pinned = ? WHERE id IN (${placeholders})`, [pinned ? 1 : 0, ...itemRowIds]);
}
