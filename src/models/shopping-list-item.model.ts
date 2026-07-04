export interface ShoppingListItem {
	rowId: number;
	productId: string;
	quantity: number;
	storeId?: string;
	done?: boolean;
}