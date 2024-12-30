import { ROWS, customNameCorrections, peopleNames } from "../constants/index.ts";
import type { DataKeys } from "../types.ts";
import { decimalToDate, decimalToTime } from "./dates.ts";
import { transformFamily } from "./family.ts";

const reconstructNamesFromDictionary = (words: string[]): string[] => {
  const result: string[] = [];
  let currentIndex = 0;

  while (currentIndex < words.length) {
    let foundName = false;

    // Intenta emparejar nombres completos usando el diccionario
    for (const [fullName, nameParts] of Object.entries(peopleNames)) {
      // Compara si las palabras en el índice actual coinciden con las del diccionario
      const match = nameParts.every((part, i) => words[currentIndex + i] === part);

      if (match) {
        result.push(fullName); // Añade el nombre completo
        currentIndex += nameParts.length; // Salta las palabras usadas
        foundName = true;
        break;
      }
    }

    if (!foundName) {
      // Si no se encuentra coincidencia, añade la palabra como está y avanza
      result.push(words[currentIndex]);
      currentIndex++;
    }
  }

  return result;
};
const applyCustomNameCorrections = (names: string[]): string[] => {
  return names.map((name) => {
    const correctedName = Object.keys(customNameCorrections).find((key) => key.toLowerCase() === name.toLowerCase());
    return correctedName ? customNameCorrections[correctedName] : name;
  });
};

const processNames = (names: string[]): string[] => {
  const withSurnames = reconstructNamesFromDictionary(names);

  const withFamily = transformFamily(withSurnames);
  const withCorrections = applyCustomNameCorrections(withFamily);
  const parsed = withCorrections;
  return parsed;
};

export const processField = (
  field: string | undefined,
  fieldName: DataKeys,
): string | string[] | boolean | number | undefined | null => {
  if (typeof field === "string" && field === "null") {
    return;
  }

  if (ROWS.Numeral.includes(fieldName)) {
    const numField = Number(field);
    if (!Number.isNaN(numField)) {
      return numField;
    }
    return;
  }
  if (ROWS.Boolean.includes(fieldName)) {
    if (field === "1" || field === "TRUE" || field === "true") {
      return true;
    }
    if (field === "0" || field === "FALSE" || field === "false") {
      return false;
    }
    return;
  }
  if (ROWS.Date.includes(fieldName)) {
    const numField = Number(field);
    if (!Number.isNaN(numField)) {
      return decimalToDate(numField);
    }
    return;
  }
  if (ROWS.Time.includes(fieldName)) {
    const numField = Number(field);
    if (!Number.isNaN(numField)) {
      return decimalToTime(numField);
    }
    return;
  }
  if (typeof field === "string" && ROWS.Arrayed.includes(fieldName)) {
    // separa por espacios y borra ,
    const arrayed = field
      .split(" ")
      .filter(Boolean)
      .map((item) => item.replace(/^[.,]+|[.,]+$/g, "")); // Elimina puntos y comas al inicio o final

    const parsed = arrayed;

    if (!parsed) {
      return [];
    }

    return processNames(parsed);
  }

  if (field) {
    return String(field).replace(/^[.,]+|[.,]+$/g, "");
  }
};
