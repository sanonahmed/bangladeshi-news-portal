"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Clock,
  Compass,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  BookOpen,
  HelpCircle,
  Building2,
  Table,
} from "lucide-react";
import {
  DIVISIONS_GEO,
  type DivisionWeatherPrayerResult,
  type PrayerItem,
  type DayForecast,
} from "@/lib/weather-prayer";
import { getDivisionWeatherPrayer } from "@/actions/weather-prayer";

interface WeatherPrayerPageClientProps {
  initialData: DivisionWeatherPrayerResult;
  allDivisionsSummary: {
    key: string;
    name: string;
    temperature: number;
    temperatureBn: string;
    conditionBn: string;
    conditionIcon: string;
  }[];
}

const DISTRICT_PRAYER_OFFSETS = [
  { district: "ঢাকা ও পার্শ্ববর্তী", offset: "০ মিনিট (মানক সময়)" },
  { district: "চট্টগ্রাম, কক্সবাজার, বান্দরবান", offset: "-৫ মিনিট" },
  { district: "সিলেট, মৌলভীবাজার, হবিগঞ্জ", offset: "-৬ মিনিট" },
  { district: "কুমিল্লা, ব্রাহ্মণবাড়িয়া, ফেনী", offset: "-৪ মিনিট" },
  { district: "ময়মনসিংহ, নেত্রকোণা", offset: "০ মিনিট" },
  { district: "বরিশাল, পটুয়াখালী, ভোলা", offset: "+১ মিনিট" },
  { district: "খুলনা, যশোর, বাগেরহাট", offset: "+৪ মিনিট" },
  { district: "রংপুর, দিনাজপুর, কুড়িগ্রাম", offset: "+৪ মিনিট" },
  { district: "রাজশাহী, চাঁপাইনবাবগঞ্জ, বগুড়া", offset: "+৭ মিনিট" },
];

export function WeatherPrayerPageClient({
  initialData,
  allDivisionsSummary,
}: WeatherPrayerPageClientProps) {
  const [data, setData] = useState<DivisionWeatherPrayerResult>(initialData);
  const [selectedDivisionKey, setSelectedDivisionKey] = useState<string>(initialData.division.key);
  const [isPending, startTransition] = useTransition();

  const handleSelectDivision = (key: string) => {
    setSelectedDivisionKey(key);
    startTransition(async () => {
      const res = await getDivisionWeatherPrayer(key);
      setData(res);
    });
  };

  const renderWeatherIcon = (iconName: string, size = "w-6 h-6", color = "text-amber-500") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${size} ${color}`} />;
      case "cloud-sun":
        return <CloudSun className={`${size} text-amber-500`} />;
      case "cloud":
        return <Cloud className={`${size} text-blue-400`} />;
      case "cloud-drizzle":
        return <CloudDrizzle className={`${size} text-blue-400`} />;
      case "cloud-rain":
        return <CloudRain className={`${size} text-blue-500`} />;
      case "cloud-lightning":
        return <CloudLightning className={`${size} text-purple-500`} />;
      default:
        return <Sun className={`${size} ${color}`} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-3">
        <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">আবহাওয়া ও নামাজের সময়সূচি</span>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-black text-white p-6 md:p-8 border-b-4 border-[var(--color-primary)] shadow-md">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 text-xs font-semibold mb-3 border border-white/10">
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span>বাংলাদেশ বার্তা লাইফস্টাইল ও ইসলামিক সেবা</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-4xl font-extrabold tracking-tight">
            দৈনিক আবহাওয়া বার্তা ও নামাজের পূর্ণাঙ্গ সময়সূচি
          </h1>
          <p className="text-sm md:text-base text-zinc-300 mt-2 leading-relaxed">
            ইসলামিক ফাউন্ডেশন বাংলাদেশ অনুমোদিত ওয়াক্তভিত্তিক নামাজের সময় এবং আবহাওয়া অধিদপ্তরের উপগ্রহভিত্তিক রিয়েল-টাইম পূর্বাভাস।
          </p>
        </div>
      </div>

      {/* 8 Divisions Weather Snapshot Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b-2 border-[var(--color-primary)] pb-2">
          <h2 className="bengali-headline text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>৮টি বিভাগের বর্তমান তাপমাত্রা ও আবহাওয়া</span>
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">ক্লিক করে বিস্তারিত দেখুন</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {allDivisionsSummary.map((div) => {
            const isSelected = div.key === selectedDivisionKey;
            return (
              <button
                key={div.key}
                onClick={() => handleSelectDivision(div.key)}
                className={`p-3 text-center border transition-all ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md scale-102"
                    : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                <div className="text-xs font-bold">{div.name}</div>
                <div className="my-1 flex justify-center">
                  {renderWeatherIcon(div.conditionIcon, "w-5 h-5", isSelected ? "text-white" : "text-amber-500")}
                </div>
                <div className="text-base font-black font-mono">
                  {div.temperatureBn}°<span className="text-xs font-normal">সে.</span>
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                  {div.conditionBn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Division Details: Weather & Prayer Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Full Weather Details (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-5">
              <h3 className="bengali-headline text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{data.division.name} বিভাগের আবহাওয়া ও পূর্বাভাস</span>
              </h3>
              <span className="text-xs bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] font-bold px-2.5 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                {data.weather.conditionBn}
              </span>
            </div>

            {/* Current Big Display */}
            <div className="flex items-center gap-6 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-6">
              <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800">
                {renderWeatherIcon(data.weather.conditionIcon, "w-12 h-12")}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="bengali-headline text-5xl font-black text-[var(--color-text)]">
                    {data.weather.temperatureBn}
                  </span>
                  <span className="text-2xl font-bold text-[var(--color-text-muted)]">°সে.</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  অনুভূত তাপমাত্রা: <strong className="text-[var(--color-text)]">{data.weather.feelsLikeBn}° সে.</strong>
                </p>
              </div>
            </div>

            {/* Detailed Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-center">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <div className="text-[var(--color-text-muted)]">আর্দ্রতা</div>
                <div className="text-sm font-bold mt-0.5">{data.weather.humidityBn}%</div>
              </div>
              <div className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-center">
                <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                <div className="text-[var(--color-text-muted)]">বাতাসের গতি</div>
                <div className="text-sm font-bold mt-0.5">{data.weather.windSpeedBn} কিমি/ঘণ্টা</div>
              </div>
              <div className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-center">
                <Sunrise className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <div className="text-[var(--color-text-muted)]">সূর্যোদয়</div>
                <div className="text-sm font-bold mt-0.5 font-mono">{data.weather.sunrise}</div>
              </div>
              <div className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-center">
                <Sunset className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <div className="text-[var(--color-text-muted)]">সূর্যাস্ত</div>
                <div className="text-sm font-bold mt-0.5 font-mono">{data.weather.sunset}</div>
              </div>
            </div>

            {/* 5-Day Forecast Table */}
            <h4 className="bengali-headline text-base font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span>আগামী ৫ দিনের বিস্তারিত পূর্বাভাস</span>
            </h4>

            <div className="border border-[var(--color-border)] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                  <tr>
                    <th className="p-2.5">দিন</th>
                    <th className="p-2.5">অবস্থা</th>
                    <th className="p-2.5">সর্বোচ্চ</th>
                    <th className="p-2.5">সর্বনিম্ন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.forecast.map((f, i) => (
                    <tr key={f.date + i} className="hover:bg-[var(--color-bg-secondary)]">
                      <td className="p-2.5 font-bold text-[var(--color-text)]">{f.dayBn}</td>
                      <td className="p-2.5 flex items-center gap-1.5">
                        {renderWeatherIcon(f.conditionIcon, "w-4 h-4")}
                        <span>{f.conditionBn}</span>
                      </td>
                      <td className="p-2.5 font-bold text-[var(--color-text)] font-mono">{f.tempMaxBn}° সে.</td>
                      <td className="p-2.5 text-[var(--color-text-muted)] font-mono">{f.tempMinBn}° সে.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Full Islamic Prayer Schedule (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-5">
              <h3 className="bengali-headline text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{data.division.name}ে আজকের নামাজের সময়সূচি</span>
              </h3>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                হানাফি মাযহাব মানদণ্ড
              </span>
            </div>

            {/* Active & Next Prayer Callout */}
            <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black text-white p-5 mb-6 border-l-4 border-[var(--color-primary)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-red-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>চলমান ওয়াক্ত: {data.prayer.activePrayerName}</span>
                  </div>
                  <div className="text-xl font-bold bengali-headline mt-1">
                    পরবর্তী ওয়াক্ত: {data.prayer.nextPrayerName}
                  </div>
                </div>

                <div className="text-left sm:text-right bg-white/10 px-3 py-1.5 rounded">
                  <div className="text-[11px] text-zinc-300">পরবর্তী ওয়াক্তের বাকি সময়</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                    {data.prayer.nextPrayerCountdown}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Daily Prayers Detailed Table */}
            <div className="space-y-2 mb-6">
              {data.prayer.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border flex items-center justify-between transition-all ${
                    item.isActive
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                      : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${item.isActive ? "bg-white animate-pulse" : "bg-[var(--color-border-strong)]"}`}></span>
                    <div>
                      <div className="font-bold text-sm">{item.name}</div>
                      <div className={`text-[10px] ${item.isActive ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                        {item.periodBn}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold font-mono">{item.timeBn}</div>
                    <div className={`text-[10px] font-mono ${item.isActive ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                      {item.time24} (২৪ ঘণ্টা)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sehri & Iftar Banner */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>সেহরি শেষ সময়: <strong className="text-sm font-mono text-[var(--color-text)]">{data.prayer.sehriEnd}</strong></span>
              </div>
              <div className="text-[var(--color-border-strong)] hidden sm:block">|</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>ইফতারের সময়: <strong className="text-sm font-mono text-[var(--color-primary)]">{data.prayer.iftar}</strong></span>
              </div>
            </div>

            {/* District Time Differences Guide */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h4 className="bengali-headline text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>ঢাকার সময়ের সাথে জেলাভিত্তিক যোগ/বিয়োগ নির্দেশিকা:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                {DISTRICT_PRAYER_OFFSETS.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <span>{d.district}</span>
                    <strong className="text-[var(--color-primary)] font-mono">{d.offset}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
