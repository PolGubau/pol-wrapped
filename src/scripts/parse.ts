import { existsSync, promises } from "node:fs";

import { read, utils } from "xlsx";
import { DESIRED_TIMES, INPUT_PATH, OUTPUT_PATH, PAGE_INDEX } from "../constants/index.ts";
import type { Data, DataKeys, OutputData } from "../types.ts";
import { calculateDeviation } from "../utils/dates.ts";
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

    const addDerivedColumns = (row: Data): OutputData => {
      const newRow = { ...row } as OutputData;

      // Aquí puedes agregar nuevas columnas, como `count-daily-people-meet`
      if (row["who-i-met"] && row["lunch-with"] && row["dinner-with"]) {
        newRow.countDailyMeet = [...new Set([...row["lunch-with"], ...row["dinner-with"], ...row["who-i-met"]])].length;
      }
      if (row["sleep-time"]) {
        newRow.sleepDeviation = calculateDeviation(row["sleep-time"], DESIRED_TIMES["sleep-time"]);
      }

      if (row["lunch-time"]) {
        newRow.lunchDeviation = calculateDeviation(row["lunch-time"], DESIRED_TIMES["lunch-time"]);
      }

      if (row["dinner-time"]) {
        newRow.dinnerDeviation = calculateDeviation(row["dinner-time"], DESIRED_TIMES["dinner-time"]);
      }

      if (row["wakeup-time"]) {
        newRow.wakeupDeviation = calculateDeviation(row["wakeup-time"], DESIRED_TIMES["wake-time"]);
      }

      return newRow;
    };

    // Procesar los datos
    const processedData = rawData.map((row) => {
      const transformedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, processField(value, key as DataKeys)]),
      ) as unknown as Data;
      return addDerivedColumns(transformedRow);
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
