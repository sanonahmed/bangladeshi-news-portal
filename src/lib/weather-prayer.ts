/**
 * Weather & Islamic Prayer Times service for Bangladesh
 * Timezone: Asia/Dhaka
 */
import { toBengaliDigits } from "./bengali-date";

export interface DivisionGeo {
  key: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  prayerOffsetMinutes: number; // Offset from Dhaka standard
}

export const DIVISIONS_GEO: DivisionGeo[] = [
  { key: "dhaka", name: "ঢাকা", nameEn: "Dhaka", lat: 23.8103, lon: 90.4125, prayerOffsetMinutes: 0 },
  { key: "chattogram", name: "চট্টগ্রাম", nameEn: "Chattogram", lat: 22.3569, lon: 91.7832, prayerOffsetMinutes: -5 },
  { key: "rajshahi", name: "রাজশাহী", nameEn: "Rajshahi", lat: 24.3745, lon: 88.6042, prayerOffsetMinutes: 7 },
  { key: "khulna", name: "খুলনা", nameEn: "Khulna", lat: 22.8456, lon: 89.5403, prayerOffsetMinutes: 4 },
  { key: "barishal", name: "বরিশাল", nameEn: "Barishal", lat: 22.7010, lon: 90.3535, prayerOffsetMinutes: 1 },
  { key: "sylhet", name: "সিলেট", nameEn: "Sylhet", lat: 24.8949, lon: 91.8687, prayerOffsetMinutes: -6 },
  { key: "rangpur", name: "রংপুর", nameEn: "Rangpur", lat: 25.7439, lon: 89.2752, prayerOffsetMinutes: 4 },
  { key: "mymensingh", name: "ময়মনসিংহ", nameEn: "Mymensingh", lat: 24.7471, lon: 90.4203, prayerOffsetMinutes: 0 },
];

export interface CurrentWeather {
  temperature: number;
  temperatureBn: string;
  feelsLike: number;
  feelsLikeBn: string;
  humidity: number;
  humidityBn: string;
  windSpeed: number;
  windSpeedBn: string;
  conditionBn: string;
  conditionIcon: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
}

export interface DayForecast {
  date: string;
  dayBn: string;
  tempMax: number;
  tempMaxBn: string;
  tempMin: number;
  tempMinBn: string;
  conditionBn: string;
  conditionIcon: string;
}

export interface PrayerItem {
  id: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  name: string;
  time24: string;
  timeBn: string;
  endTimeBn: string;
  periodBn: string;
  isActive: boolean;
  isNext: boolean;
}

export interface ProhibitedTimeItem {
  name: string;
  timeRangeBn: string;
  noteBn: string;
}

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sehriEnd: string;
  sehriEndBn: string;
  iftar: string;
  iftarBn: string;
  sunriseBn: string;
  sunsetBn: string;
  ishraqBn: string;
  jawwalBn: string;
  tahajjudBn: string;
  items: PrayerItem[];
  activePrayerName: string;
  nextPrayerName: string;
  nextPrayerCountdown: string;
  isProhibited: boolean;
  prohibitedNote?: string;
  prohibitedTimes: ProhibitedTimeItem[];
}

export interface DivisionWeatherPrayerResult {
  division: DivisionGeo;
  weather: CurrentWeather;
  forecast: DayForecast[];
  prayer: PrayerTimesData;
  updatedAt: string;
}

function getWeatherCondition(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: "পরিষ্কার আকাশ", icon: "sun" };
    case 1:
      return { text: "প্রধানত পরিষ্কার", icon: "sun" };
    case 2:
      return { text: "আংশিক মেঘলা", icon: "cloud-sun" };
    case 3:
      return { text: "মেঘলা আকাশ", icon: "cloud" };
    case 45:
    case 48:
      return { text: "কুয়াশাচ্ছন্ন", icon: "fog" };
    case 51:
    case 53:
    case 55:
      return { text: "গুঁড়ি গুঁড়ি বৃষ্টি", icon: "cloud-drizzle" };
    case 61:
    case 63:
      return { text: "হালকা থেকে মাঝারি বৃষ্টি", icon: "cloud-rain" };
    case 65:
      return { text: "ভারী বৃষ্টিপাত", icon: "cloud-rain" };
    case 80:
    case 81:
    case 82:
      return { text: "বর্ষণমুখর আবহাওয়া", icon: "cloud-lightning" };
    case 95:
    case 96:
    case 99:
      return { text: "বজ্রসহ বৃষ্টিপাত", icon: "cloud-lightning" };
    default:
      return { text: "সাধারণ আবহাওয়া", icon: "sun" };
  }
}

const BENGALI_WEEKDAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

/**
 * Format 24-hr string "15:44" to Bengali 12-hr with period "বিকেল ৩:৪৪"
 */
export function formatPrayerTimeBengali(time24: string): { timeBn: string; periodBn: string } {
  if (!time24) return { timeBn: "--:--", periodBn: "" };
  const parts = time24.split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parts[1] || "00";

  let periodBn = "সকাল";
  if (hours >= 12 && hours < 16) {
    periodBn = "দুপুর";
  } else if (hours >= 16 && hours < 18) {
    periodBn = "বিকেল";
  } else if (hours >= 18 && hours < 20) {
    periodBn = "সন্ধ্যা";
  } else if (hours >= 20 || hours < 5) {
    periodBn = "রাত";
  } else if (hours >= 5 && hours < 12) {
    periodBn = "ভোর / সকাল";
  }

  let h12 = hours % 12;
  if (h12 === 0) h12 = 12;

  const timeBn = `${toBengaliDigits(h12)}:${toBengaliDigits(minutes)}`;
  return { timeBn, periodBn };
}

/**
 * Adjust 24-hr time string "04:47" by minute delta
 */
function adjustTime(time24: string, deltaMinutes: number): string {
  const parts = time24.split(":");
  let h = parseInt(parts[0] || "0", 10);
  let m = parseInt(parts[1] || "0", 10) + deltaMinutes;

  while (m >= 60) {
    m -= 60;
    h = (h + 1) % 24;
  }
  while (m < 0) {
    m += 60;
    h = (h - 1 + 24) % 24;
  }

  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * In-memory short caches for high performance
 */
const weatherCache = new Map<string, { data: any; expiresAt: number }>();
const prayerCache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Fetch real-time weather from Open-Meteo
 */
export async function fetchDivisionWeather(div: DivisionGeo): Promise<{ current: CurrentWeather; forecast: DayForecast[] }> {
  const now = Date.now();
  const cached = weatherCache.get(div.key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${div.lat}&longitude=${div.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia%2FDhaka`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

    const data = await res.json();
    const cur = data.current;
    const cond = getWeatherCondition(cur.weather_code);

    const sunriseIso = data.daily?.sunrise?.[0] || "";
    const sunsetIso = data.daily?.sunset?.[0] || "";
    const sunriseTime = sunriseIso.split("T")[1] || "06:05";
    const sunsetTime = sunsetIso.split("T")[1] || "17:20";

    const currentWeather: CurrentWeather = {
      temperature: Math.round(cur.temperature_2m * 10) / 10,
      temperatureBn: toBengaliDigits(Math.round(cur.temperature_2m)),
      feelsLike: Math.round(cur.apparent_temperature * 10) / 10,
      feelsLikeBn: toBengaliDigits(Math.round(cur.apparent_temperature)),
      humidity: cur.relative_humidity_2m,
      humidityBn: toBengaliDigits(cur.relative_humidity_2m),
      windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
      windSpeedBn: toBengaliDigits(Math.round(cur.wind_speed_10m)),
      conditionBn: cond.text,
      conditionIcon: cond.icon,
      isDay: Boolean(cur.is_day),
      sunrise: sunriseTime,
      sunset: sunsetTime,
    };

    const forecastDays: DayForecast[] = [];
    if (data.daily?.time) {
      for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
        const dStr = data.daily.time[i];
        const dObj = new Date(dStr);
        const dayBn = BENGALI_WEEKDAYS[dObj.getDay()] || "দিন";
        const cCode = data.daily.weather_code?.[i] ?? 0;
        const cInfo = getWeatherCondition(cCode);
        const tMax = Math.round(data.daily.temperature_2m_max?.[i] ?? 30);
        const tMin = Math.round(data.daily.temperature_2m_min?.[i] ?? 22);

        forecastDays.push({
          date: dStr,
          dayBn,
          tempMax: tMax,
          tempMaxBn: toBengaliDigits(tMax),
          tempMin: tMin,
          tempMinBn: toBengaliDigits(tMin),
          conditionBn: cInfo.text,
          conditionIcon: cInfo.icon,
        });
      }
    }

    const payload = { current: currentWeather, forecast: forecastDays };
    weatherCache.set(div.key, { data: payload, expiresAt: now + 5 * 60 * 1000 });
    return payload;
  } catch (err) {
    console.warn(`Weather fetch failed for ${div.key}, using fallback:`, err);
    // Reliable static fallback
    const fallbackCurrent: CurrentWeather = {
      temperature: 29,
      temperatureBn: toBengaliDigits(29),
      feelsLike: 33,
      feelsLikeBn: toBengaliDigits(33),
      humidity: 68,
      humidityBn: toBengaliDigits(68),
      windSpeed: 2,
      windSpeedBn: toBengaliDigits(2),
      conditionBn: "পরিষ্কার আকাশ",
      conditionIcon: "sun",
      isDay: true,
      sunrise: "০৬:০৫",
      sunset: "১৭:২০",
    };
    const fallbackForecast: DayForecast[] = [
      { date: "আজ", dayBn: "আজ", tempMax: 31, tempMaxBn: "৩১", tempMin: 22, tempMinBn: "২২", conditionBn: "পরিষ্কার আকাশ", conditionIcon: "sun" },
      { date: "আগামীকাল", dayBn: "আগামীকাল", tempMax: 30, tempMaxBn: "৩০", tempMin: 21, tempMinBn: "২১", conditionBn: "আংশিক মেঘলা", conditionIcon: "cloud-sun" },
    ];
    return { current: fallbackCurrent, forecast: fallbackForecast };
  }
}

export interface RawPrayerTimings {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const rawPrayerTimingsCache = new Map<string, { timings: RawPrayerTimings; expiresAt: number }>();

/**
 * Calculate the exact minute of the day in Bangladesh Standard Time (UTC+6, 0 - 1439)
 * Pure arithmetic UTC + 6 hours ensures 100% accuracy regardless of server or browser locale.
 */
export function getDhakaMinutes(date: Date = new Date()): number {
  try {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const bdDate = new Date(utcMs + 6 * 3600000);
    const h = bdDate.getHours();
    const m = bdDate.getMinutes();
    if (!isNaN(h) && !isNaN(m)) {
      return h * 60 + m;
    }
  } catch {
    // fallback to Intl if available
  }

  try {
    const bdFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = bdFormatter.formatToParts(date);
    const bdHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const bdMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return bdHour * 60 + bdMinute;
  } catch {
    return date.getHours() * 60 + date.getMinutes();
  }
}

/**
 * Compute active prayer, next prayer, and live countdown dynamically
 */
export function computePrayerState(timings: RawPrayerTimings, referenceDate: Date = new Date()) {
  const currentMinutes = getDhakaMinutes(referenceDate);

  const toMinutes = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const mFajr = toMinutes(timings.fajr);
  const mSunrise = toMinutes(timings.sunrise);
  const mDhuhr = toMinutes(timings.dhuhr);
  const mAsr = toMinutes(timings.asr);
  const mMaghrib = toMinutes(timings.maghrib);
  const mIsha = toMinutes(timings.isha);
  const mJawwal = Math.max(0, mDhuhr - 22); // ~11:20 AM

  let activeId: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "none" = "none";
  let activeName = "এশা";
  let nextId: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" = "fajr";
  let nextName = "ফজর";
  let nextMinutes = mFajr;
  let isProhibited = false;
  let prohibitedNote = "";

  if (currentMinutes < mFajr) {
    activeId = "none";
    activeName = "তাহাজ্জুদ ও সেহরি";
    nextId = "fajr";
    nextName = "ফজর";
    nextMinutes = mFajr;
  } else if (currentMinutes >= mFajr && currentMinutes < mSunrise) {
    activeId = "fajr";
    activeName = "ফজর";
    nextId = "dhuhr";
    nextName = "জোহর";
    nextMinutes = mDhuhr;
  } else if (currentMinutes >= mSunrise && currentMinutes < mSunrise + 20) {
    activeId = "none";
    activeName = "সূর্যোদয় (নামাজ নিষিদ্ধ সময়)";
    isProhibited = true;
    prohibitedNote = "সূর্যোদয়ের সময় প্রায় ১৫-২০ মিনিট যে কোনো নামাজ পড়া নিষিদ্ধ (মাকরূহে তাহরিমি)";
    nextId = "dhuhr";
    nextName = "জোহর";
    nextMinutes = mDhuhr;
  } else if (currentMinutes >= mSunrise + 20 && currentMinutes < mJawwal) {
    activeId = "none";
    activeName = "ইশরাক ও চাশত (নফল ওয়াক্ত)";
    nextId = "dhuhr";
    nextName = "জোহর";
    nextMinutes = mDhuhr;
  } else if (currentMinutes >= mJawwal && currentMinutes < mDhuhr) {
    activeId = "none";
    activeName = "দ্বিপ্রহর / জাওয়াল (নামাজ নিষিদ্ধ সময়)";
    isProhibited = true;
    prohibitedNote = "সূর্য ঠিক মধ্যাকাশে অবস্থানকালে নামাজ পড়া নিষিদ্ধ";
    nextId = "dhuhr";
    nextName = "জোহর";
    nextMinutes = mDhuhr;
  } else if (currentMinutes >= mDhuhr && currentMinutes < mAsr) {
    activeId = "dhuhr";
    activeName = "জোহর";
    nextId = "asr";
    nextName = "আসর";
    nextMinutes = mAsr;
  } else if (currentMinutes >= mAsr && currentMinutes < mMaghrib) {
    activeId = "asr";
    activeName = "আসর (হানাফি)";
    nextId = "maghrib";
    nextName = "মাগরিব (ইফতার)";
    nextMinutes = mMaghrib;
  } else if (currentMinutes >= mMaghrib && currentMinutes < mIsha) {
    activeId = "maghrib";
    activeName = "মাগরিব";
    nextId = "isha";
    nextName = "এশা";
    nextMinutes = mIsha;
  } else {
    activeId = "isha";
    activeName = "এশা";
    nextId = "fajr";
    nextName = "ফজর";
    nextMinutes = mFajr + 24 * 60;
  }

  const diffMinutes = Math.max(0, nextMinutes - currentMinutes);
  const countdownHours = Math.floor(diffMinutes / 60);
  const countdownRemMinutes = diffMinutes % 60;

  let nextPrayerCountdown = "";
  if (countdownHours > 0) {
    nextPrayerCountdown = `${toBengaliDigits(countdownHours)} ঘণ্টা ${toBengaliDigits(countdownRemMinutes)} মিনিট বাকি`;
  } else {
    nextPrayerCountdown = `${toBengaliDigits(countdownRemMinutes)} মিনিট বাকি`;
  }

  const items: PrayerItem[] = [
    {
      id: "fajr",
      name: "ফজর",
      time24: timings.fajr,
      timeBn: formatPrayerTimeBengali(timings.fajr).timeBn,
      endTimeBn: formatPrayerTimeBengali(timings.sunrise).timeBn,
      periodBn: "ভোর",
      isActive: activeId === "fajr",
      isNext: nextId === "fajr",
    },
    {
      id: "dhuhr",
      name: "জোহর",
      time24: timings.dhuhr,
      timeBn: formatPrayerTimeBengali(timings.dhuhr).timeBn,
      endTimeBn: formatPrayerTimeBengali(timings.asr).timeBn,
      periodBn: "দুপুর",
      isActive: activeId === "dhuhr",
      isNext: nextId === "dhuhr",
    },
    {
      id: "asr",
      name: "আসর",
      time24: timings.asr,
      timeBn: formatPrayerTimeBengali(timings.asr).timeBn,
      endTimeBn: formatPrayerTimeBengali(timings.maghrib).timeBn,
      periodBn: "বিকেল",
      isActive: activeId === "asr",
      isNext: nextId === "asr",
    },
    {
      id: "maghrib",
      name: "মাগরিব",
      time24: timings.maghrib,
      timeBn: formatPrayerTimeBengali(timings.maghrib).timeBn,
      endTimeBn: formatPrayerTimeBengali(timings.isha).timeBn,
      periodBn: "সন্ধ্যা",
      isActive: activeId === "maghrib",
      isNext: nextId === "maghrib",
    },
    {
      id: "isha",
      name: "এশা",
      time24: timings.isha,
      timeBn: formatPrayerTimeBengali(timings.isha).timeBn,
      endTimeBn: formatPrayerTimeBengali(timings.fajr).timeBn,
      periodBn: "রাত",
      isActive: activeId === "isha",
      isNext: nextId === "isha",
    },
  ];

  return {
    activeId,
    activeName,
    nextId,
    nextName,
    nextPrayerCountdown,
    isProhibited,
    prohibitedNote,
    items,
  };
}

/**
 * Fetch or compute Islamic Prayer Times for a division
 */
export async function fetchDivisionPrayerTimes(div: DivisionGeo): Promise<PrayerTimesData> {
  const now = Date.now();
  let entry = rawPrayerTimingsCache.get(div.key);

  if (!entry || entry.expiresAt <= now) {
    try {
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(div.nameEn)}&country=Bangladesh&method=1&school=1`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`Aladhan API status: ${res.status}`);

      const json = await res.json();
      const t = json.data?.timings;

      const rawFajr = t.Fajr?.slice(0, 5) || "04:48";
      const rawSunrise = t.Sunrise?.slice(0, 5) || "06:05";
      const rawDhuhr = t.Dhuhr?.slice(0, 5) || "11:42";
      const rawAsr = t.Asr?.slice(0, 5) || "15:43";
      const rawMaghrib = t.Maghrib?.slice(0, 5) || "17:19";
      const rawIsha = t.Isha?.slice(0, 5) || "18:36";

      entry = {
        timings: {
          fajr: rawFajr,
          sunrise: rawSunrise,
          dhuhr: rawDhuhr,
          asr: rawAsr,
          maghrib: rawMaghrib,
          isha: rawIsha,
        },
        expiresAt: now + 4 * 60 * 60 * 1000,
      };
      rawPrayerTimingsCache.set(div.key, entry);
    } catch (err) {
      console.warn(`Prayer fetch failed for ${div.key}, using calculated baseline:`, err);
      const delta = div.prayerOffsetMinutes;
      entry = {
        timings: {
          fajr: adjustTime("04:48", delta),
          sunrise: adjustTime("06:05", delta),
          dhuhr: adjustTime("11:42", delta),
          asr: adjustTime("15:43", delta),
          maghrib: adjustTime("17:19", delta),
          isha: adjustTime("18:36", delta),
        },
        expiresAt: now + 60 * 60 * 1000,
      };
      rawPrayerTimingsCache.set(div.key, entry);
    }
  }

  return buildPrayerStructure(div, entry.timings);
}

function buildPrayerStructure(div: DivisionGeo, timings: RawPrayerTimings): PrayerTimesData {
  const sehriEnd = adjustTime(timings.fajr, -5); // Sehri ends 5 mins before Fajr
  const iftar = timings.maghrib; // Iftar is at Maghrib

  const state = computePrayerState(timings, new Date());

  const prohibitedTimes: ProhibitedTimeItem[] = [
    {
      name: "সূর্যোদয়কালীন সময়",
      timeRangeBn: `সকাল ${formatPrayerTimeBengali(timings.sunrise).timeBn} - ${formatPrayerTimeBengali(adjustTime(timings.sunrise, 20)).timeBn}`,
      noteBn: "সূর্যোদয়ের সময় থেকে সূর্য পূর্ণ রূপ লাভ করা পর্যন্ত (১৫-২০ মিনিট) নামাজ পড়া নিষেধ।",
    },
    {
      name: "ঠিক দ্বিপ্রহর / জাওয়াল",
      timeRangeBn: `দুপুর ${formatPrayerTimeBengali(adjustTime(timings.dhuhr, -22)).timeBn} - ${formatPrayerTimeBengali(timings.dhuhr).timeBn}`,
      noteBn: "সূর্য ঠিক মধ্যাকাশে থাকার সময় নামাজ পড়া নিষেধ (জোহর শুরু হওয়ার সাথে সাথে নিষেধাজ্ঞা শেষ হয়)।",
    },
    {
      name: "সূর্যাস্তকালীন সময়",
      timeRangeBn: `বিকেল ${formatPrayerTimeBengali(adjustTime(timings.maghrib, -15)).timeBn} - ${formatPrayerTimeBengali(timings.maghrib).timeBn}`,
      noteBn: "সূর্যাস্তের সময় যে কোনো নফল নামাজ পড়া নিষেধ (তবে সেদিনের আসর কাযা হয়ে থাকলে তা আদায় করতে হবে)।",
    },
  ];

  return {
    fajr: timings.fajr,
    sunrise: timings.sunrise,
    dhuhr: timings.dhuhr,
    asr: timings.asr,
    maghrib: timings.maghrib,
    isha: timings.isha,
    sehriEnd,
    sehriEndBn: formatPrayerTimeBengali(sehriEnd).timeBn,
    iftar,
    iftarBn: formatPrayerTimeBengali(iftar).timeBn,
    sunriseBn: formatPrayerTimeBengali(timings.sunrise).timeBn,
    sunsetBn: formatPrayerTimeBengali(timings.maghrib).timeBn,
    ishraqBn: formatPrayerTimeBengali(adjustTime(timings.sunrise, 20)).timeBn,
    jawwalBn: `${formatPrayerTimeBengali(adjustTime(timings.dhuhr, -22)).timeBn} - ${formatPrayerTimeBengali(timings.dhuhr).timeBn}`,
    tahajjudBn: "রাত ১২:০০ - ভোর ৪:০০",
    items: state.items,
    activePrayerName: state.activeName,
    nextPrayerName: state.nextName,
    nextPrayerCountdown: state.nextPrayerCountdown,
    isProhibited: state.isProhibited,
    prohibitedNote: state.prohibitedNote,
    prohibitedTimes,
  };
}
