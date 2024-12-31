import type { Data, Stats } from "../../../types.ts";
import { convertMinutesToTime, convertTimeToMinutes } from "../../dates.ts";

export const getLunchStats = (inputData: Data[]): Stats["food"]["lunch"] => {
  // lunch stats
  // timings
  // avg
  const lunchTimings = inputData.map((entry) => entry["lunch-time"]); // ["12:00", "13:00", "12:30"]
  // we need to convert the timings to minutes
  const lunchTimingsInMinutes = lunchTimings.map((t) => {
    if (!t) {
      return 0;
    }
    return convertTimeToMinutes(t);
  });

  const lunchTimingsSum = lunchTimingsInMinutes.reduce((acc, curr) => acc + curr, 0);

  const lunchTimingsAvg = convertMinutesToTime(Math.round(lunchTimingsSum / lunchTimingsInMinutes.length));
  // max
  const lunchTimingsMax = convertMinutesToTime(Math.max(...lunchTimingsInMinutes));
  // min
  const lunchTimingsMin = convertMinutesToTime(Math.min(...lunchTimingsInMinutes));

  // amount
  const lunchAmount = inputData.filter((entry) => entry.lunch).length;
  // ratio
  const lunchRatio = Math.round((lunchAmount / inputData.length) * 100);

  // top places
  const lunchTopPlaces: Record<string, number> = {};
  for (const entry of inputData) {
    if (entry["lunch-place"]) {
      lunchTopPlaces[entry["lunch-place"]] = (lunchTopPlaces[entry["lunch-place"]] || 0) + 1;
    }
  }
  // order places
  const lunchTopPlacesOrdered = Object.fromEntries(Object.entries(lunchTopPlaces).sort(([, a], [, b]) => b - a));

  // top people
  const lunchTopPeople: Record<string, number> = {};
  for (const entry of inputData) {
    for (const people of entry["lunch-with"] || []) {
      const normalizedPeople = people.trim().toLowerCase().replace(/\s+/g, " ");
      lunchTopPeople[normalizedPeople] = (lunchTopPeople[normalizedPeople] || 0) + 1;
    }
  }
  const orderedLunchTopPeople = Object.fromEntries(Object.entries(lunchTopPeople).sort(([, a], [, b]) => b - a));

  // top food
  const lunchTopFood: Record<string, number> = {};
  for (const entry of inputData) {
    if (entry.lunch) {
      lunchTopFood[entry.lunch] = (lunchTopFood[entry.lunch] || 0) + 1;
    }
  }
  const orderedLunchTopFood = Object.fromEntries(Object.entries(lunchTopFood).sort(([, a], [, b]) => b - a));

  return {
    timing: {
      average: lunchTimingsAvg,
      max: lunchTimingsMax,
      min: lunchTimingsMin,
    },
    amount: lunchAmount,
    ratio: lunchRatio,
    topPlaces: lunchTopPlacesOrdered,
    topPeople: orderedLunchTopPeople,
    topFood: orderedLunchTopFood,
  };
};
