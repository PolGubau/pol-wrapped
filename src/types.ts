export interface Data {
  date?: string;
  ducha?: null | string;
  "sleep-time"?: string; // Formato: "HH:MM"
  "wakeup-time"?: string;
  "sleep-place"?: string;
  lunch?: string;
  "lunch-time"?: string;
  "lunch-place"?: string;
  "lunch-with"?: string[];
  "dinner-food"?: string;
  "dinner-time"?: string;
  "dinner-place"?: string;
  "dinner-with"?: string[];
  "who-i-met"?: string[] | null | string;
  "secure-2": boolean;
  "car-used": boolean;
  coffee?: number;
  went_outside?: boolean;
  places?: null | string;
  doctor?: boolean;
  gym: boolean | string;
  alcohol?: string;
  "tv-show"?: string;
  "films-seen"?: string;
  "secure-1"?: boolean | null | string;
  videogames?: string;
  train?: string;
  bus?: boolean | string;
  metro?: string;
  dreams?: string;
  events?: string;
  rate?: number;
  weight?: string;
}

export interface OutputData extends Data {
  countDailyMeet?: number;
  sleepDeviation?: number;
  lunchDeviation?: number;
  dinnerDeviation?: number;
  wakeupDeviation?: number;
}

export type DataKeys = keyof Data;

export type DataValues = Data[DataKeys];
