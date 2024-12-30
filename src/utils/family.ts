import { familyMembers } from "../constants/index.ts";

// Regex mejorado para capturar la palabra "family" en cualquier contexto.
const familyRegexWithSymbolsAround = /(^|\W)family($|\W)/i;

/**
 * Transforma un valor o array de valores, reemplazando cualquier coincidencia de "family"
 * (independientemente de su posición) por un array específico `familyMembers`.
 *
 * @param value - Un string o un array de strings para transformar.
 * @returns Un array de strings con las transformaciones aplicadas.
 */
export const transformFamily = (value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    // Procesar cada elemento del array y reemplazar "family" con `familyMembers`.
    return value.flatMap((item) => {
      if (typeof item === "string" && familyRegexWithSymbolsAround.test(item)) {
        return familyMembers;
      }
      return item;
    });
  }

  if (typeof value === "string" && familyRegexWithSymbolsAround.test(value)) {
    return familyMembers; // Reemplazar el string "family" con el array de miembros de la familia.
  }

  // Retornar un array vacío si no hay coincidencias.
  return [];
};
