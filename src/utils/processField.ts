import { ROWS } from "../constants/index.ts";
import type { DataKeys } from "../types.ts";
import { decimalToDate, decimalToTime } from "./dates.ts";

export const processField = (
	field: string | undefined,
	fieldName: DataKeys,
): string | string[] | boolean | number | undefined | null => {
	if (typeof field === "string" && field === "null") {
		return null;
	}
	// Verificar si el campo es 'rate' y tiene un valor numérico entre 0 y 5
	if (fieldName === "rate") {
		const numField = Number(field);
		if (!Number.isNaN(numField) && numField >= 0 && numField <= 5) {
			return numField;
		}
		return null;
	}
	// Verificar si el campo es 'rate' y tiene un valor numérico entre 0 y 5
	if (fieldName === "coffee") {
		const numField = Number(field);
		if (!Number.isNaN(numField)) {
			return numField;
		}
	}

	if (
		typeof field === "string" &&
		field.includes(" ") &&
		ROWS.Arrayed.includes(fieldName)
	) {
		// separa por espacios y borra ,
		const arrayed = field.split(" ").filter(Boolean);
		const noCommas = arrayed.map((item) => item.replace(",", ""));
		return noCommas;
	}

	// Verificar si el campo es un valor booleano representado por 0 o 1 en Excel
	const numField = Number(field);
	if (!Number.isNaN(numField)) {
		if (numField === 1) {
			return true;
		}
		if (numField === 0) {
			return false;
		}
		if (numField > 1) {
			return decimalToDate(numField);
		}
		return decimalToTime(numField); // Solo convertimos el tiempo si no es una fecha
	}

	// Verificar si el campo es una cadena que representa un valor booleano
	if (field === "TRUE" || field === "true" || field === "1") {
		return true;
	}
	if (field === "FALSE" || field === "false" || field === "0") {
		return false;
	}

	return field;
};
