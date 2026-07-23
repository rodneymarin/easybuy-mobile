import type { ShoppingList } from '@models/shopping-list.model';
import type { ShoppingListItem } from '@models/shopping-list-item.model';
import { getSupabaseClient } from '@lib/supabase';

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
  done: boolean;
  pinned: boolean;
}

function mapItem(row: ItemRow): ShoppingListItem {
  return {
    rowId: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    storeId: row.store_id ?? undefined,
    done: row.done,
    pinned: row.pinned,
  };
}

export async function getAllShoppingLists(): Promise<ShoppingList[]> {
  const supabase = getSupabaseClient();
  const [listsResult, itemsResult] = await Promise.all([
    supabase.from('shopping_lists').select('id, title').order('title'),
    supabase.from('shopping_list_items').select('*'),
  ]);

  if (listsResult.error) throw listsResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const lists = listsResult.data as ListRow[];
  const items = itemsResult.data as ItemRow[];

  return lists.map((l) => ({
    id: l.id,
    title: l.title,
    items: items.filter((i) => i.shopping_list_id === l.id).map(mapItem),
  }));
}

export async function getShoppingListById(id: string): Promise<ShoppingList | null> {
  const supabase = getSupabaseClient();
  const { data: list, error: listError } = await supabase.from('shopping_lists').select('id, title').eq('id', id).maybeSingle();
  if (listError) {
    if (listError.code === 'PGRST116') return null;
    throw listError;
  }
  if (!list) return null;

  const { data: items, error: itemsError } = await supabase.from('shopping_list_items').select('*').eq('shopping_list_id', id);
  if (itemsError) throw itemsError;

  return {
    id: (list as ListRow).id,
    title: (list as ListRow).title,
    items: (items as ItemRow[]).map(mapItem),
  };
}

export async function createShoppingList(id: string, title: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_lists').insert({ id, title });
  if (error) throw error;
}

export async function deleteShoppingList(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_lists').delete().eq('id', id);
  if (error) throw error;
}

export async function addItemToList(
  shoppingListId: string,
  item: Omit<ShoppingListItem, "done" | "rowId"> & { done?: boolean }
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').insert({
    shopping_list_id: shoppingListId,
    product_id: item.productId,
    store_id: item.storeId ?? null,
    quantity: item.quantity,
    done: item.done ?? false,
  });
  if (error) throw error;
}

export async function toggleItemDone(itemRowId: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error: fetchError } = await supabase.from('shopping_list_items').select('done').eq('id', itemRowId).single();
  if (fetchError) throw fetchError;
  const currentDone = (data as { done: boolean })?.done ?? false;
  const { error } = await supabase.from('shopping_list_items').update({ done: !currentDone }).eq('id', itemRowId);
  if (error) throw error;
}

export async function updateShoppingListTitle(id: string, title: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_lists').update({ title }).eq('id', id);
  if (error) throw error;
}

export async function updateItemInList(rowId: number, productId: string, quantity: number, storeId?: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').update({
    product_id: productId,
    store_id: storeId ?? null,
    quantity,
  }).eq('id', rowId);
  if (error) throw error;
}

export async function removeItemFromList(itemRowId: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').delete().eq('id', itemRowId);
  if (error) throw error;
}

export async function removeItemsFromList(itemRowIds: number[]): Promise<void> {
  if (itemRowIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').delete().in('id', itemRowIds);
  if (error) throw error;
}

export async function moveItemsToList(itemRowIds: number[], targetListId: string): Promise<void> {
  if (itemRowIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').update({ shopping_list_id: targetListId }).in('id', itemRowIds);
  if (error) throw error;
}

export async function pinItems(itemRowIds: number[], pinned: boolean): Promise<void> {
  if (itemRowIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('shopping_list_items').update({ pinned }).in('id', itemRowIds);
  if (error) throw error;
}
