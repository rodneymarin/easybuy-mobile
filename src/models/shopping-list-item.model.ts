export interface ShoppingListItem {
	productId: string;
	quantity: number;
	storeId?: string;
	done?: boolean;
}