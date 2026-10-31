/**
 * Bengali date and numeral utilities.
 * Converts dates to Bengali locale format using Intl.DateTimeFormat.
 * Timezone: Asia/Dhaka (UTC+06:00)
 */

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BENGALI_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const BENGALI_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

/**
 * Converts ASCII digits in a string/number to their Bengali equivalents.
 */
export function toBengaliDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d)] ?? d);
}

/**
 * Returns the parts of a date broken down in the Asia/Dhaka timezone.
 */
function getDhakaParts(date: Date): {
  day: number;
  month: number;
  year: number;
  hours: number;
  minutes: number;
  weekday: number;
} {
  // Use Intl to get the date parts in Dhaka timezone
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  });

  const parts = fmt.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const rawHours = parseInt(get("hour"), 10);
  // Intl hour12:false returns 24 for midnight in some environments; normalise
  const hours = rawHours === 24 ? 0 : rawHours;

  return {
    day: parseInt(get("day"), 10),
    month: parseInt(get("month"), 10) - 1, // 0-indexed
    year: parseInt(get("year"), 10),
    hours,
    minutes: parseInt(get("minute"), 10),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

/**
 * Returns the Bengali period-of-day label for a given hour (24h, Dhaka time).
 * ভোর  12am–5am  (0–4)
 * সকাল 5am–12pm (5–11)
 * দুপুর 12pm–3pm (12–14)
 * বিকাল 3pm–5pm (15–16)
 * সন্ধ্যা 5pm–7pm (17–18)
 * রাত  7pm–12am (19–23)
 */
function getPeriodOfDay(hours: number): string {
  if (hours >= 0 && hours < 5) return "ভোর";
  if (hours >= 5 && hours < 12) return "সকাল";
  if (hours >= 12 && hours < 15) return "দুপুর";
  if (hours >= 15 && hours < 17) return "বিকাল";
  if (hours >= 17 && hours < 19) return "সন্ধ্যা";
  return "রাত";
}

/**
 * Formats a Date as Bengali date: ২৪ অক্টোবর ২০২৬
 */
export function formatBengaliDate(date: Date): string {
  const { day, month, year } = getDhakaParts(date);
  const bengaliDay = toBengaliDigits(day);
  const bengaliYear = toBengaliDigits(year);
  return `${bengaliDay} ${BENGALI_MONTHS[month] ?? "জানুয়ারি"} ${bengaliYear}`;
}

/**
 * Formats a Date as Bengali weekday name: বৃহস্পতিবার
 */
export function formatBengaliDay(date: Date): string {
  const { weekday } = getDhakaParts(date);
  return BENGALI_DAYS[weekday] ?? "রবিবার";
}

/**
 * Formats a Date as Bengali time with period-of-day: রাত ৮:৩০
 */
export function formatBengaliTime(date: Date): string {
  const { hours, minutes } = getDhakaParts(date);
  const period = getPeriodOfDay(hours);

  // Display 12-hour style: map 0→12, 13→1, etc.
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const minuteStr = String(minutes).padStart(2, "0");

  const bengaliHour = toBengaliDigits(displayHour);
  const bengaliMinute = toBengaliDigits(minuteStr);

  return `${period} ${bengaliHour}:${bengaliMinute}`;
}

/**
 * Formats a Date as full Bengali date-time: ২৪ অক্টোবর ২০২৬, রাত ৮:৩০
 */
export function formatBengaliDateTime(date: Date): string {
  return `${formatBengaliDate(date)}, ${formatBengaliTime(date)}`;
}

/**
 * Returns a relative Bengali time string:
 *   - Within 1 minute   → এইমাত্র
 *   - Within 1 hour     → N মিনিট আগে
 *   - Within 24 hours   → N ঘণ্টা আগে
 *   - Yesterday         → গতকাল
 *   - Within 7 days     → N দিন আগে
 *   - Otherwise         → full formatted Bengali date
 */
export function formatRelativeBengali(date: Date): string {
  const now = getDhakaDate();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "এইমাত্র";
  }

  if (diffMinutes < 60) {
    return `${toBengaliDigits(diffMinutes)} মিনিট আগে`;
  }

  if (diffHours < 24) {
    return `${toBengaliDigits(diffHours)} ঘণ্টা আগে`;
  }

  if (diffDays === 1) {
    return "গতকাল";
  }

  if (diffDays < 7) {
    return `${toBengaliDigits(diffDays)} দিন আগে`;
  }

  return formatBengaliDate(date);
}

/**
 * Returns the current Date adjusted to Asia/Dhaka timezone.
 * The returned Date object still holds a UTC epoch value,
 * but the Dhaka wall-clock time is reflected in all our
 * Dhaka-aware helper functions above.
 */
export function getDhakaDate(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );
}

export { BENGALI_DAYS, BENGALI_MONTHS };
