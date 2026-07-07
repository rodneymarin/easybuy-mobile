import type { Price } from "@models/price.model";

export const UNIT_OF_MEASUREMENT = [
	{ id: "bag" },
	{ id: "bottle" },
	{ id: "box" },
	{ id: "container" },
	{ id: "kg" },
	{ id: "lata" },
	{ id: "lt" },
	{ id: "pack" },
	{ id: "unit" },
] as const;

export interface Product {
	id: string;
	productName: string;
	unitOfMeasurement: string;
	prices?: Price[];
}