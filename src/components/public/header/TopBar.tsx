"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { FacebookIcon, TwitterXIcon, YoutubeIcon } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { formatBengaliDate, formatBengaliDay, formatBengaliTime, formatBanglaCalendarDate, getDhakaDate } from "@/lib/bengali-date";
import { WeatherPrayerTickerPill } from "./WeatherPrayerTickerPill";
import { BookmarksNavBadge } from "./BookmarksNavBadge";
import { NotificationBellMenu } from "@/components/public/notifications/NotificationBellMenu";
import type { SiteSettings } from "@/types";

interface TopBarProps {
  settings: SiteSettings;
}

export function TopBar({ settings }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(getDhakaDate());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(getDhakaDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-8">
        {/* Left: Date & Time */}
        <div className="flex items-center gap-2 md:gap-3 text-[var(--color-text-muted)] text-[11px] md:text-xs">
          <span className="font-semibold text-[var(--color-text)]">
            {formatBengaliDay(now)}, {formatBengaliDate(now)}
          </span>
          <span className="text-[var(--color-border-strong)]">|</span>
          <span className="text-[#B8860B] font-medium hidden sm:inline">
            {formatBanglaCalendarDate(now)}
          </span>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <span>বাংলাদেশ সময় {formatBengaliTime(now)}</span>
          <WeatherPrayerTickerPill />
        </div>

        {/* Right: Links + Social + Dark Mode */}
        <div className="flex items-center gap-3">
          <NotificationBellMenu />
          <BookmarksNavBadge />
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <Link
            href="/fact-check"
            className="hover:text-[var(--color-primary)] font-bold transition-colors text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            title="ভুয়া খবর প্রতিরোধ ও সত্যসন্ধান কর্নার"
          >
            <span>ফ্যাক্ট-চেক</span>
          </Link>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <Link
            href="/live-score"
            className="hover:text-[var(--color-primary)] font-bold transition-colors text-red-600 dark:text-red-400 flex items-center gap-1"
            title="লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>লাইভ স্কোর</span>
          </Link>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <Link
            href="/epaper"
            className="hover:text-[var(--color-primary)] font-semibold transition-colors text-[var(--color-primary)] flex items-center gap-1"
            title="দৈনিক বাংলাদেশ বার্তা মুদ্রিত ডিজিটাল ই-পেপার"
          >
            <span>ই-পেপার</span>
          </Link>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <Link
            href="/audio-news"
            className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] hidden sm:inline"
            title="দৈনিক অডিও নিউজ ও ধারাবাহিক প্লেলিস্ট"
          >
            অডিও
          </Link>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <Link
            href="/debates"
            className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)] hidden sm:inline"
            title="সাপ্তাহিক জনমত জরিপ ও পাঠক বিতর্ক"
          >
            বিতর্ক
          </Link>
          <Link
            href="/archive"
            className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
          >
            আর্কাইভ
          </Link>
          <Link
            href="/videos"
            className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
          >
            ভিডিও
          </Link>
          <Link
            href="/admin"
            className="hover:text-[var(--color-primary)] font-semibold transition-colors text-[var(--color-text-muted)]"
          >
            অ্যাডমিন
          </Link>
          <span className="text-[var(--color-border-strong)]">|</span>

          {/* Social Icons */}
          <div className="flex items-center gap-1.5">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[var(--color-text-muted)] hover:text-[#1877F2] transition-colors"
              >
                <FacebookIcon size={13} />
              </a>
            )}
            {settings.twitterUrl && (
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <TwitterXIcon size={13} />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[var(--color-text-muted)] hover:text-[#FF0000] transition-colors"
              >
                <YoutubeIcon size={13} />
              </a>
            )}
          </div>

          <span className="text-[var(--color-border-strong)]">|</span>

          {/* Dark mode toggle — only rendered after mount to avoid hydration mismatch */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="থিম পরিবর্তন"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
