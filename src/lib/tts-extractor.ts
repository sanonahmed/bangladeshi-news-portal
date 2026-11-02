import { toBengaliDigits } from "@/lib/bengali-date";

/**
 * Strips HTML tags, entities, and excessive whitespace from content.
 */
export function cleanHtmlToText(html: string): string {
  if (!html) return "";

  // Replace block elements with space or newline
  let text = html
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")
    .replace(/<style[^>]*>([\S\s]*?)<\/style>/gim, "")
    .replace(/<figcaption[^>]*>([\S\s]*?)<\/figcaption>/gim, "")
    .replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gim, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Collapse consecutive whitespaces
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Splits text into natural sentence chunks for speech synthesis.
 * Uses Bengali punctuation (দাঁড়ি ।, প্রশ্নবোধক ?, বিস্ময়সূচক !) and standard breaks.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Split on Bengali full stop (।), question mark (?), exclamation (!), or period (.)
  const rawChunks = text.split(/([।?!.])/);
  const sentences: string[] = [];

  for (let i = 0; i < rawChunks.length; i += 2) {
    const sentence = rawChunks[i]?.trim();
    const punct = rawChunks[i + 1]?.trim() || "";
    if (sentence) {
      const full = punct ? `${sentence}${punct}` : sentence;
      // Filter out trivial non-alphabetic fragments
      if (full.length > 2) {
        sentences.push(full);
      }
    }
  }

  return sentences.length > 0 ? sentences : [text];
}

/**
 * Calculates estimated listening duration in seconds based on word count.
 * Average reading speed for spoken Bengali news is ~125 words per minute.
 */
export function estimateAudioDuration(
  text: string,
  rate: number = 1.0
): { totalSeconds: number; formatted: string } {
  if (!text) return { totalSeconds: 0, formatted: "০ সেকেন্ড" };

  const words = text.split(/\s+/).filter(Boolean).length;
  // standard: 125 wpm at rate 1.0
  const adjustedWpm = 125 * Math.max(0.5, rate);
  const totalMinutes = words / adjustedWpm;
  const totalSeconds = Math.max(5, Math.round(totalMinutes * 60));

  return {
    totalSeconds,
    formatted: formatDurationBengali(totalSeconds),
  };
}

/**
 * Formats seconds into natural Bengali duration string (যেমন: ৩ মিনিট ১৫ সেকেন্ড)
 */
export function formatDurationBengali(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${toBengaliDigits(secs)} সেকেন্ড`;
  }

  if (secs === 0) {
    return `${toBengaliDigits(mins)} মিনিট`;
  }

  return `${toBengaliDigits(mins)} মিনিট ${toBengaliDigits(secs)} সেকেন্ড`;
}

/**
 * Formats time in digital format: ০২:১৫
 */
export function formatDigitalTimeBengali(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsStr = String(mins).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");
  return `${toBengaliDigits(minsStr)}:${toBengaliDigits(secsStr)}`;
}
