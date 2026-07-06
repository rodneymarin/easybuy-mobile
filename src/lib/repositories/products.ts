import type { SQLiteDatabase } from 'expo-sqlite';
import type { Product } from '@models/product.model';
import type { Price } from '@models/price.model';
import { getDatabase } from '@lib/database';

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
  const db = await getDatabase();
  const products = await db.getAllAsync<ProductRow>("SELECT id, product_name, unit_of_measurement FROM products ORDER BY product_name");
  const prices = await db.getAllAsync<PriceRow>("SELECT product_id, store_id, value FROM product_prices");

  return products.map((p) => ({
    id: p.id,
    productName: p.product_name,
    unitOfMeasurement: p.unit_of_measurement,
    prices: prices
      .filter((pr) => pr.product_id === p.id)
      .map((pr): Price => ({ storeId: pr.store_id, value: pr.value })),
  }));
}

export async function createProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("INSERT INTO products (id, product_name, unit_of_measurement) VALUES (?, ?, ?)", [id, productName, unitOfMeasurement]);
  for (const price of prices) {
    await db.runAsync("INSERT INTO product_prices (product_id, store_id, value) VALUES (?, ?, ?)", [id, price.storeId, price.value]);
  }
}

export async function updateProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE products SET product_name = ?, unit_of_measurement = ? WHERE id = ?", [productName, unitOfMeasurement, id]);
  await db.runAsync("DELETE FROM product_prices WHERE product_id = ?", [id]);
  for (const price of prices) {
    await db.runAsync("INSERT INTO product_prices (product_id, store_id, value) VALUES (?, ?, ?)", [id, price.storeId, price.value]);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM product_prices WHERE product_id = ?", [id]);
  await db.runAsync("DELETE FROM shopping_list_items WHERE product_id = ?", [id]);
  await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`DELETE FROM product_prices WHERE product_id IN (${placeholders})`, ids);
  await db.runAsync(`DELETE FROM shopping_list_items WHERE product_id IN (${placeholders})`, ids);
  await db.runAsync(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
}
