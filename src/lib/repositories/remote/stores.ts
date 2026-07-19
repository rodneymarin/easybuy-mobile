import type { Store } from '@models/store.model';
import { getSupabaseClient } from '@lib/supabase';

interface StoreRow {
  id: string;
  description: string;
  color: number;
}

export async function getAllStores(): Promise<Store[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('stores').select('id, description, color').order('description');
  if (error) throw error;
  return (data ?? []).map((row: StoreRow) => ({ id: row.id, description: row.description, color: row.color }));
}

export async function createStore(id: string, description: string, color: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('stores').insert({ id, description, color });
  if (error) throw error;
}

export async function updateStore(id: string, description: string, color: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('stores').update({ description, color }).eq('id', id);
  if (error) throw error;
}

export async function deleteStore(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteStores(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('stores').delete().in('id', ids);
  if (error) throw error;
}
