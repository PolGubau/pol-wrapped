import fs from "node:fs";
import { JSON_DATA_PATH, STATS_PATH } from "../constants/index.ts";
import type { Data, Months, Stats, Streak, TimeBoundary } from "../types.ts";
import { convertMinutesToTime, convertTimeToMinutes } from "../utils/dates.ts";
import { getDinnerStats } from "../utils/stats/food/dinner.ts";
import { getLunchStats } from "../utils/stats/food/lunch.ts";

const getFoodStats = (inputData: Data[]): Stats["food"] => {
  const lunch = getLunchStats(inputData);
  const dinner = getDinnerStats(inputData);

  return {
    lunch,
    dinner,
  };
};

const showerStats = (inputData: Data[]): Stats["shower"] => {
  const shower: Stats["shower"] = {
    amount: 0,
    ratio: 0,
    topPlaces: {},
    longerStreak: 0,
    longerNoShowerStreak: 0,
  };

  for (const entry of inputData) {
    if (entry.ducha) {
      shower.amount++;
      if (entry.ducha) {
        shower.topPlaces[entry.ducha] = (shower.topPlaces[entry.ducha] || 0) + 1;
      }
    }
  }

  // Calculate shower streaks
  let currentShowerStreak = 0;
  let currentNoShowerStreak = 0;
  let longestShowerStreak = 0;
  let longestNoShowerStreak = 0;

  for (const entry of inputData) {
    if (entry.ducha) {
      currentShowerStreak++;
      currentNoShowerStreak = 0;
    } else {
      currentNoShowerStreak++;
      currentShowerStreak = 0;
    }

    longestShowerStreak = Math.max(longestShowerStreak, currentShowerStreak);
    longestNoShowerStreak = Math.max(longestNoShowerStreak, currentNoShowerStreak);
  }
  shower.longerStreak = longestShowerStreak;
  shower.longerNoShowerStreak = longestNoShowerStreak;

  // Calculate the yearly shower percentage
  const totalDays = inputData.length;
  const showerDays = shower.amount;

  shower.ratio = Math.round((showerDays / totalDays) * 100);

  return shower;
};

function getPeopleStreaks(data: Data[], limit = 5): Streak[] {
  const streaks: Streak[] = [];

  // Creamos un mapa para guardar las rachas por persona
  const streaksByPerson: Record<string, { start: string; end: string; amount: number; lastDate: string }> = {};

  // Ordenamos los datos por fecha
  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recorremos los datos de cada día
  data.forEach((entry, index) => {
    if (entry["who-i-met"]) {
      for (const person of entry["who-i-met"]) {
        if (streaksByPerson[person]) {
          const lastStreak = streaksByPerson[person];
          const prevDate = new Date(lastStreak.lastDate).getTime();
          const currentDate = new Date(entry.date).getTime();

          // Si es el siguiente día consecutivo, extendemos la racha
          if (prevDate + 86400000 === currentDate) {
            streaksByPerson[person].amount += 1;
            streaksByPerson[person].end = entry.date;
            streaksByPerson[person].lastDate = entry.date;
          } else if (prevDate !== currentDate) {
            // Si no es consecutivo, reiniciamos la racha
            streaksByPerson[person] = { start: entry.date, end: entry.date, amount: 1, lastDate: entry.date };
          }
        } else {
          streaksByPerson[person] = { start: entry.date, end: entry.date, amount: 1, lastDate: entry.date };
        }
      }
    }
  });

  // Convertimos el mapa de rachas en un array y lo ordenamos
  for (const person in streaksByPerson) {
    const streak = streaksByPerson[person];
    streaks.push({
      amount: streak.amount,
      start: streak.start,
      end: streak.end,
      who: person,
    });
  }

  // Ordenamos las rachas de mayor a menor cantidad de días consecutivos y devolvemos las más largas
  return streaks.sort((a, b) => b.amount - a.amount).slice(0, limit);
}
const getPeopleStats = (inputData: Data[]): Stats["people"] => {
  const people: Stats["people"] = {
    averageDailyMet: 0,
    maxDailyMet: 0,
    minDailyMet: 0,
    topPeople: {},
    longestmeetingStreak: getPeopleStreaks(inputData),
  };

  // Calculate the average, max, and min number of people met daily
  const peopleMet = inputData.map((entry) => entry["who-i-met"]?.length ?? 0);
  const totalDays = inputData.length;
  const totalPeopleMet = peopleMet.reduce((acc, curr) => acc + curr, 0);

  people.averageDailyMet = Math.round(totalPeopleMet / totalDays);
  people.maxDailyMet = Math.max(...peopleMet);
  people.minDailyMet = Math.min(...peopleMet);

  // Calculate the most common people met
  for (const entry of inputData) {
    for (const p of entry["who-i-met"] || []) {
      const normalizedPeople = p.trim().toLowerCase().replace(/\s+/g, " ");
      people.topPeople[normalizedPeople] = (people.topPeople[normalizedPeople] || 0) + 1;
    }
  }
  const orderedPeople = Object.entries(people.topPeople).sort((a, b) => b[1] - a[1]);
  people.topPeople = Object.fromEntries(orderedPeople);

  people.longestmeetingStreak = getPeopleStreaks(inputData);

  return people;
};
const getAlcoholStats = (inputData: Data[]): Stats["alcohol"] => {
  const alcohol: Stats["alcohol"] = {
    ratio: 0,
    amountDays: 0,
    amountDrinks: 0,
    topDrinks: {},
  };

  for (const entry of inputData) {
    if (entry.alcohol && Array.isArray(entry.alcohol)) {
      // Filtrar valores inválidos y normalizar las bebidas
      const drinks = entry.alcohol.map((drink) => drink.trim()).filter(Boolean);

      alcohol.amountDrinks += drinks.length;
      if (drinks.length > 0) {
        alcohol.amountDays++;
      }

      for (const drink of drinks) {
        const normalizedDrink = drink.toLowerCase().replace(/\s+/g, " ");
        alcohol.topDrinks[normalizedDrink] = (alcohol.topDrinks[normalizedDrink] || 0) + 1;
      }
      const orderedDrinks = Object.entries(alcohol.topDrinks).sort((a, b) => b[1] - a[1]);
      alcohol.topDrinks = Object.fromEntries(orderedDrinks);
    }
  }

  const totalDays = inputData.length;
  alcohol.ratio = totalDays > 0 ? Math.round((alcohol.amountDays / totalDays) * 100) : 0;

  return alcohol;
};
const getBasicStats = (inputData: Data[], key: keyof Data): Stats["doctor"] => {
  const data = {
    amount: 0,
    ratio: 0,
  };

  for (const entry of inputData) {
    if (entry[key]) {
      data.amount++;
    }
  }

  const totalDays = inputData.length;
  data.ratio = Math.round((data.amount / totalDays) * 100);

  return data;
};

const getTimingBoundary = (inputData: Data[], key: keyof Data): TimeBoundary => {
  const wakeupTimings = inputData.map((entry) => entry[key]); // ["10:00", "08:00", "09:30"]
  // we need to convert the timings to minutes
  const wakeupTimingsInMinutes = wakeupTimings.map((t) => {
    if (!t) {
      return 0;
    }
    return convertTimeToMinutes(t as string);
  });

  const wakeupTimingsSum = wakeupTimingsInMinutes.reduce((acc, curr) => acc + curr, 0);
  const wakeupTimingsAvg = convertMinutesToTime(Math.round(wakeupTimingsSum / wakeupTimingsInMinutes.length));
  // max
  const wakeupTimingsMax = convertMinutesToTime(Math.max(...wakeupTimingsInMinutes));
  // min
  const wakeupTimingsMin = convertMinutesToTime(Math.min(...wakeupTimingsInMinutes));

  const dateWithTheMax = inputData.find((entry) => entry[key] === wakeupTimingsMax);
  const dateWithTheMin = inputData.find((entry) => entry[key] === wakeupTimingsMin);
  return {
    average: wakeupTimingsAvg,
    max: {
      date: dateWithTheMax?.date || "unknown",
      time: wakeupTimingsMax,
    },
    min: {
      date: dateWithTheMin?.date || "unknown",
      time: wakeupTimingsMin,
    },
  };
};
const getSleepingTimeStats = (inputData: Data[]): Stats["sleep"] => {
  // places is a array of name, amount and ratio of each place I slept, name is the string of the place, amount is the number of times I slept there and ratio is the percentage of times I slept there, if I slept in 2 different places, the ratio will be 50 (50%) for each.

  const places: { name: string; amount: number; ratio: number }[] = [];

  const getRatio = (amount: number, total: number) => {
    return Math.round((amount / total) * 100);
  };

  for (const entry of inputData) {
    if (entry["sleep-place"]) {
      const place = entry["sleep-place"];
      const index = places.findIndex((p) => p.name === place);
      if (index !== -1) {
        places[index].amount++;
        places[index].ratio = getRatio(places[index].amount, inputData.length);
      } else {
        places.push({ name: place, amount: 1, ratio: getRatio(1, inputData.length) });
      }
    }
  }

  // sort by amount
  const sortedPlaces = places.sort((a, b) => b.amount - a.amount);

  return {
    places: sortedPlaces,
    wakingUpTimings: getTimingBoundary(inputData, "wakeup-time"),
    sleepingTimings: getTimingBoundary(inputData, "sleep-time"),
  };
};

const getSecure1 = (inputData: Data[]): Stats["secure1"] => {
  const data: Stats["secure1"] = {
    amount: 0,
    ratio: 0,
    topPlaces: {},
    months: {
      January: { amount: 0, ratio: 0 },
      February: { amount: 0, ratio: 0 },
      March: { amount: 0, ratio: 0 },
      April: { amount: 0, ratio: 0 },
      May: { amount: 0, ratio: 0 },
      June: { amount: 0, ratio: 0 },
      July: { amount: 0, ratio: 0 },
      August: { amount: 0, ratio: 0 },
      September: { amount: 0, ratio: 0 },
      October: { amount: 0, ratio: 0 },
      November: { amount: 0, ratio: 0 },
      December: { amount: 0, ratio: 0 },
    },
  };

  const getMonthRatio = (amount: number, total: number) => {
    // porcentaje sobre el año que se ha hecho este mes, si enero tiene 4 y febrero 2, enero tendrá un 66% y febrero un 33%
    return Math.round((amount / total) * 100);
  };

  for (const entry of inputData) {
    if (entry["secure-1"]) {
      data.amount++;
      data.topPlaces[entry["secure-1"]] = (data.topPlaces[entry["secure-1"]] || 0) + 1;

      const month = new Date(entry.date).toLocaleString("en-US", { month: "long" }) as Months;
      data.months[month].amount++;
    }
  }

  const totalDays = data.amount;
  data.ratio = Math.round((data.amount / inputData.length) * 100);

  // Ahora calculamos los ratios mensuales correctamente
  data.months = Object.fromEntries(
    Object.entries(data.months).map(([month, { amount }]) => [
      month,
      { amount, ratio: getMonthRatio(amount, totalDays) }, // Aquí usamos totalDays como denominador
    ]),
  );

  const sortedPlaces = Object.entries(data.topPlaces).sort((a, b) => b[1] - a[1]);
  data.topPlaces = Object.fromEntries(sortedPlaces);

  return data;
};

const getWeightStats = (inputData: Data[]): Stats["weight"] => {
  const weight: Stats["weight"] = {
    average: 0,
    max: {
      date: "00-00-0000",
      weight: 0,
    },
    min: {
      date: "00-00-0000",
      weight: 0,
    },
    points: [],
  };

  const weightData = inputData
    .filter((entry) => entry.weight)
    .map((entry) => {
      return {
        date: entry.date,
        weight: Number(entry.weight),
      };
    });

  const totalDays = weightData.length;
  const totalWeight = weightData.reduce((acc, curr) => acc + curr.weight, 0);

  weight.average = Math.round(totalWeight / totalDays);

  const maxWeight = Math.max(...weightData.map((entry) => entry.weight));
  const minWeight = Math.min(...weightData.map((entry) => entry.weight));

  weight.max = weightData.find((entry) => entry.weight === maxWeight) || weight.max;
  weight.min = weightData.find((entry) => entry.weight === minWeight) || weight.min;
  weight.points = weightData;

  return weight;
};

export function generateStats(): Stats {
  // Read input data
  const inputData = JSON.parse(fs.readFileSync(JSON_DATA_PATH, "utf-8")) as Data[];

  const stats: Stats = {
    doctor: {
      amount: 0,
      ratio: 0,
    },
    weight: {
      average: 0,
      max: {
        date: "00-00-0000",
        weight: 0,
      },
      min: {
        date: "00-00-0000",
        weight: 0,
      },
      points: [],
    },
    sleep: {
      places: [],
      wakingUpTimings: {
        average: "00:00",
        max: {
          date: "00-00-0000",
          time: "00:00",
        },
        min: {
          date: "00-00-0000",
          time: "00:00",
        },
      },
      sleepingTimings: {
        average: "00:00",
        max: {
          date: "00-00-0000",
          time: "00:00",
        },
        min: {
          date: "00-00-0000",
          time: "00:00",
        },
      },
    },
    carUsage: {
      ratio: 0,
      amount: 0,
    },
    food: {
      lunch: {
        timing: {
          average: "00:00",
          max: "00:00",
          min: "00:00",
        },
        amount: 0,
        ratio: 0,
        topPlaces: {},
        topPeople: {},
        topFood: {},
      },
      dinner: {
        timing: {
          average: "00:00",
          max: "00:00",
          min: "00:00",
        },
        amount: 0,
        ratio: 0,
        topPlaces: {},
        topPeople: {},
        topFood: {},
      },
    },

    people: {
      averageDailyMet: 0,
      maxDailyMet: 0,
      minDailyMet: 0,
      topPeople: {},
      longestmeetingStreak: {
        amount: 0,
        start: "",
        end: "",
        who: "",
      },
    },

    shower: {
      amount: 0,
      ratio: 0,
      topPlaces: {},
      longerStreak: 0,
      longerNoShowerStreak: 0,
    },
    gym: {
      ratio: 0,
      amount: 0,
    },
    alcohol: {
      ratio: 0,
      amountDays: 0,
      amountDrinks: 0,
      topDrinks: {},
    },
    wentOutside: {
      ratio: 0,
      amount: 0,
    },
    secure1: {
      ratio: 0,
      amount: 0,
      topPlaces: {},
    },
    secure2: {
      ratio: 0,
      amount: 0,
    },
  };

  stats.food = getFoodStats(inputData);
  stats.shower = showerStats(inputData);
  stats.gym = getBasicStats(inputData, "gym");
  stats.people = getPeopleStats(inputData);
  stats.alcohol = getAlcoholStats(inputData);
  stats.doctor = getBasicStats(inputData, "doctor");
  stats.carUsage = getBasicStats(inputData, "car-used");
  stats.sleep = getSleepingTimeStats(inputData);
  stats.weight = getWeightStats(inputData);
  stats.wentOutside = getBasicStats(inputData, "went_outside");
  stats.secure1 = getSecure1(inputData);
  stats.secure2 = getBasicStats(inputData, "secure-2");
  // Write stats to output file
  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
  console.info(`Stats generated and saved to ${STATS_PATH}`);
  return stats;
}
