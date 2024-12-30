import { read, set_fs, utils } from "@mirror/xlsx";

import { PAGE_INDEX } from "../constants/index.ts";

// Habilitar compatibilidad con Deno
set_fs(Deno);

interface ExcelRow {
	[key: string]: string | undefined;
}

// Función para convertir el número decimal a hora
const decimalToTime = (decimal: number): string => {
	const hours = Math.floor(decimal * 24); // Obtener las horas
	const minutes = Math.round((decimal * 24 - hours) * 60); // Obtener los minutos
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Función para convertir el número de serie de Excel a fecha
const decimalToDate = (serial: number): string => {
	const epoch = new Date(1900, 0, 1);
	epoch.setDate(epoch.getDate() + serial - 2);
	return epoch.toLocaleDateString("en-GB");
};

// Función para procesar un campo
const processField = (
	field: string | undefined,
	fieldName: string,
): string | string[] | boolean | number | undefined | null => {
	if (typeof field === "string" && field === "null") {
		return null;
	}
	if (typeof field === "string" && field.includes(" ")) {
		return field.split(" ").filter(Boolean);
	}

	// Verificar si el campo es 'rate' y tiene un valor numérico entre 0 y 5
	if (fieldName === "rate") {
		const numField = Number(field);
		if (!Number.isNaN(numField) && numField >= 0 && numField <= 5) {
			return numField;
		}
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

// Función principal para convertir Excel a JSON
export const convertExcelToJson = async (
	excelFilePath: string,
	jsonOutputPath: string,
): Promise<void> => {
	try {
		// Verificar que el archivo existe
		const excelExists = await Deno.stat(excelFilePath).catch(() => false);
		if (!excelExists) {
			console.error("%c⚠️  El archivo Excel no existe.", "color: red");

			return;
		}

		// Leer el archivo Excel
		const data = await Deno.readFile(excelFilePath);
		const workbook = read(data, { type: "buffer" });

		// Usar la primera hoja
		const sheetName = workbook.SheetNames[PAGE_INDEX];
		const sheet = workbook.Sheets[sheetName];

		if (!sheet) {
			console.error("No se pudo encontrar la hoja especificada.");
			return;
		}

		// Convertir la hoja a JSON
		const rawData: ExcelRow[] = utils.sheet_to_json(sheet);

		// Procesar los datos
		const processedData = rawData.map((row) => {
			return Object.fromEntries(
				Object.entries(row).map(([key, value]) => [
					key,
					processField(value, key),
				]),
			);
		});

		// Guardar en JSON
		await Deno.writeTextFile(
			jsonOutputPath,
			JSON.stringify(processedData, null, 2),
		);
		console.log(
			`%cArchivo JSON guardado en: ${jsonOutputPath}`,
			"color: green",
		);
	} catch (error) {
		console.error("Error al procesar el archivo:", error);
	}
};
