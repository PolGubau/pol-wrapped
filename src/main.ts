import { convertExcelToJson } from "./scripts/parse.ts";

// cmd ->
//  deno run --allow-read --allow-write --import-map=import_map.json --allow-import src/main.ts

convertExcelToJson();
