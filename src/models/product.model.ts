import type { Price } from "@models/price.model";

export const UNIT_OF_MEASUREMENT = [
	{ id: "kg", label: "Kg" },
	{ id: "lt", label: "Litro" },
	{ id: "unit", label: "Unidad" },
	{ id: "bag", label: "Bolsa" },
	{ id: "container", label: "Envase" },
	{ id: "pack", label: "Paquete" },
	{ id: "box", label: "Caja" },
	{ id: "bottle", label: "Botella" },
] as const;

export interface Product {
	id: string;
	productName: string;
	unitOfMeasurement: string;
	prices?: Price[];
}