import { getDataSource } from '@lib/data-source/data-source';
import type { ShoppingList } from '@models/shopping-list.model';
import type { ShoppingListItem } from '@models/shopping-list-item.model';
import * as local from './local/shopping-lists';
import * as remote from './remote/shopping-lists';

export async function getAllShoppingLists(): Promise<ShoppingList[]> {
  return getDataSource() === 'local' ? local.getAllShoppingLists() : remote.getAllShoppingLists();
}

export async function getShoppingListById(id: string): Promise<ShoppingList | null> {
  return getDataSource() === 'local' ? local.getShoppingListById(id) : remote.getShoppingListById(id);
}

export async function createShoppingList(id: string, title: string): Promise<void> {
  return getDataSource() === 'local' ? local.createShoppingList(id, title) : remote.createShoppingList(id, title);
}

export async function deleteShoppingList(id: string): Promise<void> {
  return getDataSource() === 'local' ? local.deleteShoppingList(id) : remote.deleteShoppingList(id);
}

export async function addItemToList(
  shoppingListId: string,
  item: Omit<ShoppingListItem, "done" | "rowId"> & { done?: boolean }
): Promise<void> {
  return getDataSource() === 'local' ? local.addItemToList(shoppingListId, item) : remote.addItemToList(shoppingListId, item);
}

export async function toggleItemDone(itemRowId: number): Promise<void> {
  return getDataSource() === 'local' ? local.toggleItemDone(itemRowId) : remote.toggleItemDone(itemRowId);
}

export async function updateShoppingListTitle(id: string, title: string): Promise<void> {
  return getDataSource() === 'local' ? local.updateShoppingListTitle(id, title) : remote.updateShoppingListTitle(id, title);
}

export async function updateItemInList(rowId: number, productId: string, quantity: number, storeId?: string): Promise<void> {
  return getDataSource() === 'local' ? local.updateItemInList(rowId, productId, quantity, storeId) : remote.updateItemInList(rowId, productId, quantity, storeId);
}

export async function removeItemFromList(itemRowId: number): Promise<void> {
  return getDataSource() === 'local' ? local.removeItemFromList(itemRowId) : remote.removeItemFromList(itemRowId);
}

export async function removeItemsFromList(itemRowIds: number[]): Promise<void> {
  return getDataSource() === 'local' ? local.removeItemsFromList(itemRowIds) : remote.removeItemsFromList(itemRowIds);
}

export async function moveItemsToList(itemRowIds: number[], targetListId: string): Promise<void> {
  return getDataSource() === 'local' ? local.moveItemsToList(itemRowIds, targetListId) : remote.moveItemsToList(itemRowIds, targetListId);
}

export async function pinItems(itemRowIds: number[], pinned: boolean): Promise<void> {
  return getDataSource() === 'local' ? local.pinItems(itemRowIds, pinned) : remote.pinItems(itemRowIds, pinned);
}
