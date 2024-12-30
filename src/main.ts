import { convertExcelToJson } from "./scripts/convertExcelToJson.ts";

const excelPath = "input/data.xlsx";
const jsonPath = "output/data.json";

// cmd ->
//  deno run --allow-read --allow-write --import-map=import_map.json --allow-import main.ts

convertExcelToJson(excelPath, jsonPath);
