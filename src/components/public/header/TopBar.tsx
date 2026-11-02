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
        <div className="flex items-center gap-2 md:gap-3 text-[var(--color-text-muted)] text-[11px] md:text-xs min-w-0">
          <span className="font-semibold text-[var(--color-text)] truncate">
            {formatBengaliDay(now)}, {formatBengaliDate(now)}
          </span>
          <span className="text-[var(--color-border-strong)] hidden sm:inline">|</span>
          <span className="text-[#B8860B] font-medium hidden sm:inline">
            {formatBanglaCalendarDate(now)}
          </span>
          <span className="text-[var(--color-border-strong)] hidden md:inline">|</span>
          <span className="hidden md:inline">বাংলাদেশ সময় {formatBengaliTime(now)}</span>
          <WeatherPrayerTickerPill />
        </div>

        {/* Right: Links + Social + Dark Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Desktop Service Links (hidden on mobile and tablet) */}
          <div className="hidden lg:flex items-center gap-2 text-[11px]">
            <Link
              href="/fact-check"
              className="hover:text-[var(--color-primary)] font-bold transition-colors text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              title="ভুয়া খবর প্রতিরোধ ও সত্যসন্ধান কর্নার"
            >
              <span>ফ্যাক্ট-চেক</span>
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/live-score"
              className="hover:text-[var(--color-primary)] font-bold transition-colors text-red-600 dark:text-red-400 flex items-center gap-1"
              title="লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>লাইভ স্কোর</span>
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/epaper"
              className="hover:text-[var(--color-primary)] font-semibold transition-colors text-[var(--color-primary)] flex items-center gap-1"
              title="দৈনিক বাংলাদেশ বার্তা মুদ্রিত ডিজিটাল ই-পেপার"
            >
              <span>ই-পেপার</span>
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/audio-news"
              className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
              title="দৈনিক অডিও নিউজ ও ধারাবাহিক প্লেলিস্ট"
            >
              অডিও
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/debates"
              className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
              title="সাপ্তাহিক জনমত জরিপ ও পাঠক বিতর্ক"
            >
              বিতর্ক
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/history"
              className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
              title="ঐতিহাসিক এই দিনে ও স্বাধীনতা আর্কাইভ"
            >
              ইতিহাস
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/archive"
              className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
            >
              আর্কাইভ
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/videos"
              className="hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
            >
              ভিডিও
            </Link>
            <span className="text-[var(--color-border-strong)]">|</span>
            <Link
              href="/admin"
              className="hover:text-[var(--color-primary)] font-semibold transition-colors text-[var(--color-text-muted)]"
            >
              অ্যাডমিন
            </Link>
          </div>

          {/* Social Icons (hidden on mobile, shown on md+) */}
          <div className="hidden md:flex items-center gap-1.5 border-l border-[var(--color-border-strong)] pl-2">
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

          {/* Essential Mobile & Desktop Tool Icons */}
          <div className="flex items-center gap-1 sm:gap-2 md:border-l md:border-[var(--color-border-strong)] md:pl-2">
            <NotificationBellMenu />
            <BookmarksNavBadge />
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="থিম পরিবর্তন"
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded"
                title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
              >
                {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
