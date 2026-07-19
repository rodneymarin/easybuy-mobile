import type { Product } from '@models/product.model';
import type { Price } from '@models/price.model';
import { getSupabaseClient } from '@lib/supabase';

interface ProductRow {
  id: string;
  product_name: string;
  unit_of_measurement: string;
}

interface PriceRow {
  product_id: string;
  store_id: string;
  value: number;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const [productsResult, pricesResult] = await Promise.all([
    supabase.from('products').select('id, product_name, unit_of_measurement').order('product_name'),
    supabase.from('product_prices').select('product_id, store_id, value'),
  ]);

  if (productsResult.error) throw productsResult.error;
  if (pricesResult.error) throw pricesResult.error;

  const products = productsResult.data as ProductRow[];
  const prices = pricesResult.data as PriceRow[];

  return products.map((p) => ({
    id: p.id,
    productName: p.product_name,
    unitOfMeasurement: p.unit_of_measurement,
    prices: prices
      .filter((pr) => pr.product_id === p.id)
      .map((pr): Price => ({ storeId: pr.store_id, value: pr.value })),
  }));
}

export async function getProductByName(productName: string, excludeId?: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  let query = supabase.from('products').select('id, product_name, unit_of_measurement').ilike('product_name', productName);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  const { data, error } = await query.single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  const row = data as ProductRow;
  return { id: row.id, productName: row.product_name, unitOfMeasurement: row.unit_of_measurement };
}

export async function createProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  const supabase = getSupabaseClient();
  const { error: productError } = await supabase.from('products').insert({ id, product_name: productName, unit_of_measurement: unitOfMeasurement });
  if (productError) throw productError;

  if (prices.length > 0) {
    const priceRows = prices.map((p) => ({ product_id: id, store_id: p.storeId, value: p.value }));
    const { error: pricesError } = await supabase.from('product_prices').insert(priceRows);
    if (pricesError) throw pricesError;
  }
}

export async function updateProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  const supabase = getSupabaseClient();
  const { error: productError } = await supabase.from('products').update({ product_name: productName, unit_of_measurement: unitOfMeasurement }).eq('id', id);
  if (productError) throw productError;

  const { error: deleteError } = await supabase.from('product_prices').delete().eq('product_id', id);
  if (deleteError) throw deleteError;

  if (prices.length > 0) {
    const priceRows = prices.map((p) => ({ product_id: id, store_id: p.storeId, value: p.value }));
    const { error: pricesError } = await supabase.from('product_prices').insert(priceRows);
    if (pricesError) throw pricesError;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw error;
}
