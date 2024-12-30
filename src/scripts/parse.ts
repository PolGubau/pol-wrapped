import { existsSync, promises } from "node:fs";

import { read, utils } from "xlsx";
import { INPUT_PATH, OUTPUT_PATH, PAGE_INDEX } from "../constants/index.ts";
import type { Data, DataKeys } from "../types.ts";
import { processField } from "../utils/processField.ts";

// Función principal para convertir Excel a JSON
export const convertExcelToJson = async (): Promise<void> => {
  try {
    if (!INPUT_PATH) {
      console.error("🔴 La ruta del archivo Excel no está definida.");
      return;
    }
    if (!PAGE_INDEX) {
      console.error("🔴 El índice de la hoja no está definido.");
      return;
    }

    if (OUTPUT_PATH) {
      console.info("🟡 El archivo de salida ya existe, se sobrescribirá.");
    }
    // Verificar que el archivo existe
    const excelExists = existsSync(INPUT_PATH);
    if (!excelExists) {
      console.error("🔴 El archivo Excel de entrada no existe.");

      return;
    }

    // Leer el archivo Excel
    const data = await promises.readFile(INPUT_PATH);
    const workbook = read(data, { type: "buffer" });

    // Usar la primera hoja
    const sheetName = workbook.SheetNames[PAGE_INDEX];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      console.error("No se pudo encontrar la hoja especificada.");
      return;
    }

    // Convertir la hoja a JSON
    const rawData: Data[] = utils.sheet_to_json(sheet);

    // Procesar los datos
    const processedData = rawData.map((row) => {
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, processField(value, key as DataKeys)]));
    });

    // elimina el archivo antiguo
    await promises.unlink(OUTPUT_PATH).catch(() => {
      // Ignorar si el archivo no existe
    });
    // Guardar en JSON
    await promises.writeFile(OUTPUT_PATH, JSON.stringify(processedData, null, 2));
    console.info(`%c🟢 Archivo JSON guardado en: ${OUTPUT_PATH}`, "color: green");
  } catch (error) {
    console.error("🔴 Error al procesar el archivo:", error);
  }
};
