import type { Data, Stats } from "../../../types.ts";
import { convertMinutesToTime, convertTimeToMinutes } from "../../dates.ts";

export const getDinnerStats = (inputData: Data[]): Stats["food"]["dinner"] => {
  // dinner stats
  // timings
  // avg
  const dinnerTimings = inputData.map((entry) => entry["dinner-time"]); // ["12:00", "13:00", "12:30"]
  // we need to convert the timings to minutes
  const dinnerTimingsInMinutes = dinnerTimings.map((t) => {
    if (!t) {
      return 0;
    }
    return convertTimeToMinutes(t);
  });

  const dinnerTimingsSum = dinnerTimingsInMinutes.reduce((acc, curr) => acc + curr, 0);
  const dinnerTimingsAvg = convertMinutesToTime(Math.round(dinnerTimingsSum / dinnerTimingsInMinutes.length));
  // max
  const dinnerTimingsMax = convertMinutesToTime(Math.max(...dinnerTimingsInMinutes));
  // min
  const dinnerTimingsMin = convertMinutesToTime(Math.min(...dinnerTimingsInMinutes));

  // amount
  const dinnerAmount = inputData.filter((entry) => entry["dinner-food"]).length;
  // ratio
  const dinnerRatio = Math.round((dinnerAmount / inputData.length) * 100);

  // top places
  const dinnerTopPlaces: Record<string, number> = {};
  for (const entry of inputData) {
    if (entry["dinner-place"]) {
      dinnerTopPlaces[entry["dinner-place"]] = (dinnerTopPlaces[entry["dinner-place"]] || 0) + 1;
    }
  }
  const orderedDinnerTopPlaces = Object.fromEntries(Object.entries(dinnerTopPlaces).sort(([, a], [, b]) => b - a));

  // top people
  const dinnerTopPeople: Record<string, number> = {};
  for (const entry of inputData) {
    for (const people of entry["dinner-with"] || []) {
      const normalizedPeople = people.trim().toLowerCase().replace(/\s+/g, " ");
      dinnerTopPeople[normalizedPeople] = (dinnerTopPeople[normalizedPeople] || 0) + 1;
    }
  }
  const orderedDinnerTopPeople = Object.fromEntries(Object.entries(dinnerTopPeople).sort(([, a], [, b]) => b - a));

  // top food
  const dinnerTopFood: Record<string, number> = {};
  for (const entry of inputData) {
    if (entry["dinner-food"]) {
      dinnerTopFood[entry["dinner-food"]] = (dinnerTopFood[entry["dinner-food"]] || 0) + 1;
    }
  }
  const orderedDinnerTopFood = Object.fromEntries(Object.entries(dinnerTopFood).sort(([, a], [, b]) => b - a));

  return {
    timing: {
      average: dinnerTimingsAvg,
      max: dinnerTimingsMax,
      min: dinnerTimingsMin,
    },
    amount: dinnerAmount,
    ratio: dinnerRatio,
    topPlaces: orderedDinnerTopPlaces,
    topPeople: orderedDinnerTopPeople,
    topFood: orderedDinnerTopFood,
  };
};
