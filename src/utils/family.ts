import { familyMembers } from "../constants/index.ts";

// Función para transformar "family" en el array específico
export const transformFamily = (value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item.toLowerCase() === "family") {
        return familyMembers;
      }
      return item;
    });
  }
  if (typeof value === "string" && value.includes("family")) {
    return familyMembers;
  }
  return [];
};
