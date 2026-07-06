import type { Price } from "@models/price.model";

export const UNIT_OF_MEASUREMENT = [
	{ id: "kg" },
	{ id: "lt" },
	{ id: "unit" },
	{ id: "bag" },
	{ id: "container" },
	{ id: "pack" },
	{ id: "box" },
	{ id: "bottle" },
] as const;

export interface Product {
	id: string;
	productName: string;
	unitOfMeasurement: string;
	prices?: Price[];
}