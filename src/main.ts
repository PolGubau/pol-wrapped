import { convertExcelToJson } from "./scripts/parse.ts";

const excelPath = "src/input/data.xlsx";
const jsonPath = "src/output/data.json";

// cmd ->
//  deno run --allow-read --allow-write --import-map=import_map.json --allow-import src/main.ts

convertExcelToJson(excelPath, jsonPath);
