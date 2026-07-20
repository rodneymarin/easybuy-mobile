import { cloudCall } from '@lib/data-source';
import type { Store } from '@models/store.model';
import * as local from './local/stores';
import * as remote from './remote/stores';

export async function getAllStores(): Promise<Store[]> {
  return cloudCall(() => local.getAllStores(), () => remote.getAllStores());
}

export async function createStore(id: string, description: string, color: number): Promise<void> {
  return cloudCall(() => local.createStore(id, description, color), () => remote.createStore(id, description, color));
}

export async function updateStore(id: string, description: string, color: number): Promise<void> {
  return cloudCall(() => local.updateStore(id, description, color), () => remote.updateStore(id, description, color));
}

export async function deleteStore(id: string): Promise<void> {
  return cloudCall(() => local.deleteStore(id), () => remote.deleteStore(id));
}

export async function deleteStores(ids: string[]): Promise<void> {
  return cloudCall(() => local.deleteStores(ids), () => remote.deleteStores(ids));
}
