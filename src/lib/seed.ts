import type { SQLiteDatabase } from 'expo-sqlite';

const STORES = [
  { id: "store-demo", description: "Demo Store" },
  { id: "store-test", description: "Test Store" },
] as const;

const PRODUCTS = [
  {
    id: "prod-001",
    productName: "Papa",
    unitOfMeasurement: "kg",
    prices: [
      { storeId: "store-demo", value: 2.2 },
      { storeId: "store-test", value: 3.1 },
    ],
  },
  {
    id: "prod-002",
    productName: "Cebolla",
    unitOfMeasurement: "kg",
    prices: [
      { storeId: "store-demo", value: 1.8 },
      { storeId: "store-test", value: 1.95 },
    ],
  },
  {
    id: "prod-003",
    productName: "Tomate",
    unitOfMeasurement: "kg",
    prices: [{ storeId: "store-test", value: 2.5 }],
  },
  {
    id: "prod-004",
    productName: "Leche líquida",
    unitOfMeasurement: "lt",
    prices: [
      { storeId: "store-demo", value: 1.5 },
      { storeId: "store-test", value: 1.6 },
    ],
  },
  {
    id: "prod-005",
    productName: "Yogurt Firme",
    unitOfMeasurement: "unit",
    prices: [{ storeId: "store-demo", value: 0.9 }],
  },
  {
    id: "prod-006",
    productName: "Queso Blanco",
    unitOfMeasurement: "kg",
    prices: [
      { storeId: "store-demo", value: 5.8 },
      { storeId: "store-test", value: 6.2 },
    ],
  },
  {
    id: "prod-007",
    productName: "Mantequilla",
    unitOfMeasurement: "unit",
    prices: [{ storeId: "store-test", value: 2.1 }],
  },
  {
    id: "prod-008",
    productName: "Pechuga de Pollo",
    unitOfMeasurement: "kg",
    prices: [
      { storeId: "store-demo", value: 4.5 },
      { storeId: "store-test", value: 4.2 },
    ],
  },
  {
    id: "prod-009",
    productName: "Carne Molida",
    unitOfMeasurement: "kg",
    prices: [
      { storeId: "store-demo", value: 6.9 },
      { storeId: "store-test", value: 7.1 },
    ],
  },
  {
    id: "prod-010",
    productName: "Filet de Merluza",
    unitOfMeasurement: "kg",
    prices: [],
  },
] as const;

const SHOPPING_LISTS = [
  {
    id: "0oasidu0as9dua0sd",
    title: "Lista Semanal - Verduras",
    items: [
      { productId: "prod-001", quantity: 2.5, storeId: "store-demo", done: false },
      { productId: "prod-002", quantity: 1.5, storeId: "store-demo", done: false },
      { productId: "prod-003", quantity: 2.0, storeId: "store-test", done: false },
    ],
  },
  {
    id: "aosidoaisud0a89sud0a9sdui",
    title: "Lácteos y Desayuno",
    items: [
      { productId: "prod-004", quantity: 4, storeId: "store-test", done: false },
      { productId: "prod-005", quantity: 6, storeId: "store-demo", done: false },
      { productId: "prod-006", quantity: 0.8, storeId: "store-demo", done: false },
      { productId: "prod-007", quantity: 2, storeId: "store-test", done: false },
    ],
  },
  {
    id: "aosdijqw0ewdj0as9dja0sd",
    title: "Carnicería",
    items: [
      { productId: "prod-008", quantity: 1.5, storeId: "store-test", done: false },
      { productId: "prod-009", quantity: 1.2, storeId: "store-demo", done: false },
      { productId: "prod-010", quantity: 1.0, storeId: "store-demo", done: false },
    ],
  },
] as const;

export async function seedIfEmpty(database: SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM stores"
  );
  if (row && row.count > 0) return;

  for (const store of STORES) {
    await database.runAsync("INSERT INTO stores (id, description) VALUES (?, ?)", [
      store.id,
      store.description,
    ]);
  }

  for (const product of PRODUCTS) {
    await database.runAsync(
      "INSERT INTO products (id, product_name, unit_of_measurement) VALUES (?, ?, ?)",
      [product.id, product.productName, product.unitOfMeasurement]
    );

    for (const price of product.prices) {
      await database.runAsync(
        "INSERT INTO product_prices (product_id, store_id, value) VALUES (?, ?, ?)",
        [product.id, price.storeId, price.value]
      );
    }
  }

  for (const list of SHOPPING_LISTS) {
    await database.runAsync("INSERT INTO shopping_lists (id, title) VALUES (?, ?)", [
      list.id,
      list.title,
    ]);

    for (const item of list.items) {
      await database.runAsync(
        "INSERT INTO shopping_list_items (shopping_list_id, product_id, store_id, quantity, done) VALUES (?, ?, ?, ?, ?)",
        [list.id, item.productId, item.storeId ?? null, item.quantity, item.done ? 1 : 0]
      );
    }
  }
}
