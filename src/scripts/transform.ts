import * as fs from "node:fs";
import { OUTPUT_PATH, ROWS, peopleNames } from "../constants/index.ts";
import { transformFamily } from "../utils/family.ts";

const joinNames = (names: string[]): string[] => {
	const result: string[] = [];
	let i = 0;

	while (i < names.length) {
		const name = names[i];
		const nextName = names[i + 1];

		// Verificar si el nombre actual y el siguiente forman un nombre compuesto
		const combinedName = Object.keys(peopleNames).find(
			(key) => peopleNames[key][0] === name && peopleNames[key][1] === nextName,
		);

		if (combinedName) {
			// Si encontramos el nombre compuesto, lo añadimos y saltamos el siguiente nombre
			result.push(combinedName); // Usamos el nombre completo
			i += 2; // Saltamos el siguiente nombre ya que lo hemos unido
		} else {
			// Si no es un nombre compuesto, simplemente añadimos el nombre actual
			result.push(name);
			i++; // Pasamos al siguiente nombre
		}
	}

	return result;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const processNames = (row: any): any => {
	// Iteramos sobre las claves para modificar "who-i-met", "lunch-with", etc.
	for (const key of Object.keys(row)) {
		if (ROWS.People.includes(key) && Array.isArray(row[key])) {
			row[key] = transformFamily(row[key]);
			row[key] = joinNames(row[key]);
		}
	}
	return row;
};

// Función para leer y transformar el archivo JSON
export const processJsonData = async (): Promise<void> => {
	try {
		// Verificar que el archivo JSON existe
		const fileExists = fs.existsSync(OUTPUT_PATH);
		if (!fileExists) {
			console.error("%c⚠️ El archivo JSON no existe.", "color: red");
			return;
		}

		// Leer el archivo JSON
		const data = await fs.promises.readFile(OUTPUT_PATH, "utf-8");
		const parsedData = JSON.parse(data);

		// Aplicar las transformaciones a los datos procesados
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const transformedData = parsedData.map((row: any) => {
			return processNames(row); // Procesamos cada fila con la transformación de nombres
		});

		if (fileExists) {
			await fs.promises.unlink(OUTPUT_PATH);
			console.log("%c🟡 Archivo JSON antiguo eliminado.", "color: yellow");
		}

		// Sobrescribir el archivo transformado
		await fs.promises.writeFile(
			OUTPUT_PATH,
			JSON.stringify(transformedData, null, 2),
		);
		console.log(
			`%c🟢 Archivo JSON transformado y sobrescrito en: ${OUTPUT_PATH}`,
			"color: green",
		);
	} catch (error) {
		console.error("🔴 Error al transformar el archivo:", error);
	}
};
