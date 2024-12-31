export interface Data {
  date: string;
  ducha?: null | string;
  "sleep-time": string; // Formato: "HH:MM"
  "wakeup-time": string;
  "sleep-place": string;
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
  alcohol?: string[];
  "tv-show"?: string;
  "films-seen"?: string;
  "secure-1"?: string;
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
export enum Months {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}
export type DataKeys = keyof Data;

export type DataValues = Data[DataKeys];

export interface Streak {
  amount: number;
  start: string;
  end: string;
  who: string;
}

export interface TimeBoundary {
  average: string;
  max: {
    date: string;
    time: string;
  };
  min: {
    date: string;
    time: string;
  };
}

export interface BasicStat {
  amount: number;
  ratio: number;
}
export interface Stats {
  people: {
    averageDailyMet: number;
    maxDailyMet: number;
    minDailyMet: number;
    topPeople: Record<string, number>;
    longestmeetingStreak: Streak[];
  };

  sleep: {
    places: {
      name: string;
      amount: number;
      ratio: number;
    }[];

    wakingUpTimings: TimeBoundary;
    sleepingTimings: TimeBoundary;
  };

  food: {
    lunch: {
      timing: {
        average: string;
        max: string;
        min: string;
      };
      amount: number;
      ratio: number;
      topPlaces: Record<string, number>;
      topPeople: Record<string, number>;
      topFood: Record<string, number>;
    };
    dinner: {
      timing: {
        average: string;
        max: string;
        min: string;
      };
      amount: number;
      ratio: number;
      topPlaces: Record<string, number>;
      topPeople: Record<string, number>;
      topFood: Record<string, number>;
    };
  };

  shower: {
    amount: number;
    ratio: number;
    topPlaces: Record<string, number>;
    longerStreak: number;
    longerNoShowerStreak: number;
  };

  gym: BasicStat;
  alcohol: {
    ratio: number;
    amountDays: number;
    amountDrinks: number;
    topDrinks: Record<string, number>;
  };
  doctor: {
    amount: number;
    ratio: number;
  };
  weight: {
    average: number;
    max: {
      date: string;
      weight: number;
    };
    min: {
      date: string;
      weight: number;
    };
    points: {
      date: string;
      weight: number;
    }[];
  };
  carUsage: BasicStat;
  wentOutside: BasicStat;
  secure1: {
    ratio: number;
    amount: number;
    topPlaces: Record<string, number>;
    months: Record<
      Months,
      {
        amount: number;
        ratio: number;
      }
    >;
  };
  secure2: BasicStat;
}
