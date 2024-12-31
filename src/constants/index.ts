import { correctNames, surnames } from "../input/people.ts";

export const PAGE_INDEX = 2;
export const INPUT_PATH = "src/input/data.xlsx";
export const JSON_DATA_PATH = "src/output/data.json";
export const STATS_PATH = "src/output/stats.json";

export const ROWS = {
  Arrayed: ["who-i-met", "lunch-with", "dinner-with", "metro", "alcohol", "places", "bus", "train"],
  People: ["who-i-met", "lunch-with", "dinner-with"],
  Time: ["sleep-time", "lunch-time", "dinner-time", "wakeup-time"],
  Boolean: ["car-used", "secure-2", "went-outside", "gym", "doctor"],
  Numeral: ["rate", "coffee"],
  Date: ["date"],
};

export const familyMembers = ["Victor", "Sara", "Lídia", "Joan"];

export const peopleNames = surnames;

export const DESIRED_TIMES = {
  "sleep-time": "23:30",
  "lunch-time": "13:00",
  "dinner-time": "20:00",
  "wake-time": "08:00",
};

export const customNameCorrections = correctNames;
