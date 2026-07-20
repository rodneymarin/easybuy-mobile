import { cloudCall } from '@lib/data-source';
import type { Product } from '@models/product.model';
import type { Price } from '@models/price.model';
import * as local from './local/products';
import * as remote from './remote/products';

export async function getAllProducts(): Promise<Product[]> {
  return cloudCall(() => local.getAllProducts(), () => remote.getAllProducts());
}

export async function getProductByName(productName: string, excludeId?: string): Promise<Product | null> {
  return cloudCall(() => local.getProductByName(productName, excludeId), () => remote.getProductByName(productName, excludeId));
}

export async function createProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  return cloudCall(() => local.createProduct(id, productName, unitOfMeasurement, prices), () => remote.createProduct(id, productName, unitOfMeasurement, prices));
}

export async function updateProduct(id: string, productName: string, unitOfMeasurement: string, prices: Price[]): Promise<void> {
  return cloudCall(() => local.updateProduct(id, productName, unitOfMeasurement, prices), () => remote.updateProduct(id, productName, unitOfMeasurement, prices));
}

export async function deleteProduct(id: string): Promise<void> {
  return cloudCall(() => local.deleteProduct(id), () => remote.deleteProduct(id));
}

export async function deleteProducts(ids: string[]): Promise<void> {
  return cloudCall(() => local.deleteProducts(ids), () => remote.deleteProducts(ids));
}
