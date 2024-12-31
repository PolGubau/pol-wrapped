import { generateStats } from "./scripts/generate-stats.ts";
import { convertExcelToJson } from "./scripts/parse.ts";

// Create JSON from Excel
await convertExcelToJson();

// Generate statistics
generateStats();
