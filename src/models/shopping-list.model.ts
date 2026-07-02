import type { Product } from "@/models/product.model";
import type { ShoppingListItem } from "@/models/shopping-list-item.model";

export interface ShoppingList {
	id: string;
	title: string;
	items: ShoppingListItem[];
}

export function calcListTotalAmount(list: ShoppingList, products: Product[]): number {
	const total = list.items.reduce((prev, val) => {
		const product = products.find(p => p.id === val.productId);
		if (!product) return prev;
		const price = product.prices?.find(p => p.storeId === val.storeId)?.value ?? 0;
		return prev + price * val.quantity;
	}, 0);
	return total;
}