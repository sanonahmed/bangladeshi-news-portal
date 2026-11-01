"use server";

import {
  DIVISIONS_GEO,
  fetchDivisionWeather,
  fetchDivisionPrayerTimes,
  type DivisionGeo,
  type DivisionWeatherPrayerResult,
} from "@/lib/weather-prayer";

/**
 * Get comprehensive weather and prayer times for a single division
 */
export async function getDivisionWeatherPrayer(
  divisionKey: string = "dhaka"
): Promise<DivisionWeatherPrayerResult> {
  const div =
    DIVISIONS_GEO.find((d) => d.key.toLowerCase() === divisionKey.toLowerCase()) ||
    DIVISIONS_GEO[0]!;

  const [weatherData, prayerData] = await Promise.all([
    fetchDivisionWeather(div),
    fetchDivisionPrayerTimes(div),
  ]);

  return {
    division: div,
    weather: weatherData.current,
    forecast: weatherData.forecast,
    prayer: prayerData,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get quick weather summary across all 8 divisions
 */
export async function getAllDivisionsWeatherSummary(): Promise<
  {
    key: string;
    name: string;
    temperature: number;
    temperatureBn: string;
    conditionBn: string;
    conditionIcon: string;
  }[]
> {
  try {
    const results = await Promise.all(
      DIVISIONS_GEO.map(async (div) => {
        const w = await fetchDivisionWeather(div);
        return {
          key: div.key,
          name: div.name,
          temperature: w.current.temperature,
          temperatureBn: w.current.temperatureBn,
          conditionBn: w.current.conditionBn,
          conditionIcon: w.current.conditionIcon,
        };
      })
    );
    return results;
  } catch (error) {
    console.error("getAllDivisionsWeatherSummary error:", error);
    return [];
  }
}
