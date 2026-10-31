import { describe, it, expect } from "vitest";
import {
  toBengaliDigits,
  formatBengaliDate,
  formatBengaliDay,
  formatBengaliTime,
  formatBengaliDateTime,
  formatRelativeBengali,
} from "@/lib/bengali-date";

describe("Bengali Date & Numeral Utilities", () => {
  it("converts english numerals to Bengali numerals accurately", () => {
    expect(toBengaliDigits(0)).toBe("০");
    expect(toBengaliDigits(123456789)).toBe("১২৩৪৫৬৭৮৯");
    expect(toBengaliDigits("2026-10-31")).toBe("২০২৬-১০-৩১");
  });

  it("formats date in natural Bengali month format", () => {
    const d = new Date(Date.UTC(2026, 9, 24, 14, 30)); // 24 Oct 2026
    const formatted = formatBengaliDate(d);
    expect(formatted).toContain("অক্টোবর");
    expect(formatted).toContain("২০২৬");
  });

  it("formats day of the week in Bengali", () => {
    // 24 Oct 2026 was Saturday
    const d = new Date(Date.UTC(2026, 9, 24, 6, 0));
    const day = formatBengaliDay(d);
    expect(["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"]).toContain(day);
  });

  it("formats time and full datetime in Bengali", () => {
    const d = new Date(Date.UTC(2026, 9, 24, 14, 30));
    const timeStr = formatBengaliTime(d);
    const dateTimeStr = formatBengaliDateTime(d);
    expect(timeStr.length).toBeGreaterThan(0);
    expect(dateTimeStr).toContain("২০২৬");
  });

  it("calculates relative time in Bengali correctly", () => {
    const now = new Date();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    expect(formatRelativeBengali(tenMinsAgo)).toContain("মিনিট আগে");
    expect(formatRelativeBengali(twoHoursAgo)).toContain("ঘণ্টা আগে");
  });
});
