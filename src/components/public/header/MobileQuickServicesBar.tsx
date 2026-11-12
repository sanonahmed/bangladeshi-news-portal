"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ShieldCheck,
  Newspaper,
  Headphones,
  History,
  Scale,
  Video,
  CloudSun,
} from "lucide-react";

interface ServiceItem {
  href: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  featureFlag?: string;
}

const SERVICES: ServiceItem[] = [
  {
    href: "/live-score",
    label: "লাইভ স্কোর",
    badge: "LIVE",
    badgeColor: "bg-red-600 text-white animate-pulse",
    icon: Activity,
    accentColor: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/30",
    featureFlag: "live_score",
  },
  {
    href: "/fact-check",
    label: "ফ্যাক্ট-চেক",
    icon: ShieldCheck,
    accentColor: "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30",
    featureFlag: "fact_checking",
  },
  {
    href: "/epaper",
    label: "ই-পেপার",
    icon: Newspaper,
    accentColor: "text-[var(--color-primary)] border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30",
    featureFlag: "epaper",
  },
  {
    href: "/audio-news",
    label: "অডিও নিউজ",
    icon: Headphones,
    accentColor: "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30",
    featureFlag: "audio_news",
  },
  {
    href: "/history",
    label: "ইতিহাস ও ৭১",
    icon: History,
    accentColor: "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30",
    featureFlag: "history_archive",
  },
  {
    href: "/debates",
    label: "জনমত বিতর্ক",
    icon: Scale,
    accentColor: "text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/30",
    featureFlag: "public_debates",
  },
  {
    href: "/videos",
    label: "ভিডিও",
    icon: Video,
    accentColor: "text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50 bg-purple-50/60 dark:bg-purple-950/30",
    featureFlag: "video_hub",
  },
  {
    href: "/weather-prayer",
    label: "আবহাওয়া",
    icon: CloudSun,
    accentColor: "text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/50 bg-teal-50/60 dark:bg-teal-950/30",
    featureFlag: "weather_prayer",
  },
];

interface MobileQuickServicesBarProps {
  features?: Record<string, boolean>;
}

export function MobileQuickServicesBar({ features }: MobileQuickServicesBarProps) {
  const pathname = usePathname();

  // Filter out any service whose feature flag is explicitly disabled
  const visibleServices = SERVICES.filter((item) => {
    if (item.featureFlag && features && features[item.featureFlag] === false) {
      return false;
    }
    return true;
  });

  if (visibleServices.length === 0) {
    return null;
  }

  return (
    <nav
      className="lg:hidden bg-[var(--color-bg)] border-b border-[var(--color-border)] py-1.5 px-2.5 sm:px-4 shadow-2xs"
      aria-label="মোবাইল দ্রুত সেবা লিংক"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {visibleServices.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                isActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-xs font-bold"
                  : `${item.accentColor} hover:brightness-95 active:scale-95`
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[8px] font-bold px-1 py-0.2 rounded-full leading-tight ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
