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
