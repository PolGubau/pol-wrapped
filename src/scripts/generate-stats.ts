import fs from "node:fs";
import { JSON_DATA_PATH, STATS_PATH } from "../constants/index.ts";
import type { Data, Stats, Streak } from "../types.ts";
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

const getGymStats = (inputData: Data[]): Stats["gym"] => {
  const gym: Stats["gym"] = {
    ratio: 0,
    amount: 0,
  };
  const totalDays = inputData.length;

  const gymDays = inputData.filter((entry) => entry.gym).length;
  gym.amount = gymDays;
  gym.ratio = Math.round((gymDays / totalDays) * 100);

  return gym;
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
const getDoctorStats = (inputData: Data[]): Stats["doctor"] => {
  const doctor: Stats["doctor"] = {
    amount: 0,
    ratio: 0,
  };

  for (const entry of inputData) {
    if (entry.doctor) {
      doctor.amount++;
    }
  }

  const totalDays = inputData.length;
  doctor.ratio = Math.round((doctor.amount / totalDays) * 100);

  return doctor;
};

export function generateStats(): Stats {
  // Read input data
  const inputData = JSON.parse(fs.readFileSync(JSON_DATA_PATH, "utf-8")) as Data[];

  const stats: Stats = {
    doctor: {
      amount: 0,
      ratio: 0,
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
      amount: 0,
      topDrinks: {},
    },
  };

  stats.food = getFoodStats(inputData);
  stats.shower = showerStats(inputData);
  stats.gym = getGymStats(inputData);
  stats.people = getPeopleStats(inputData);
  stats.alcohol = getAlcoholStats(inputData);
  stats.doctor = getDoctorStats(inputData);

  // Write stats to output file
  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
  console.info(`Stats generated and saved to ${STATS_PATH}`);
  return stats;
}
