import Link from "next/link";
import Image from "next/image";
import { Newspaper, CalendarDays, ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/types";

interface MastheadProps {
  settings: SiteSettings;
}

export function Masthead({ settings }: MastheadProps) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Edition & Location Info */}
        <div className="hidden lg:flex flex-col items-start text-xs text-[var(--color-text-muted)] space-y-1 w-64">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            <span>ঢাকা, বাংলাদেশ</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-faint)]">
            অনলাইন ও জাতীয় সংস্করণ
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <Link
              href="/archive"
              className="hover:text-[var(--color-primary)] transition-colors underline-offset-2 hover:underline"
            >
              পুরোনো সংখ্যা
            </Link>
            <span>•</span>
            <Link
              href="/about"
              className="hover:text-[var(--color-primary)] transition-colors underline-offset-2 hover:underline"
            >
              আমাদের কথা
            </Link>
          </div>
        </div>

        {/* Center: Iconic Newspaper Brand Masthead */}
        <div className="flex flex-col items-center text-center flex-1">
          <Link href="/" className="group inline-flex flex-col items-center">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.siteName ?? "দৈনিক বাংলাদেশ বার্তা"}
                width={320}
                height={80}
                className="h-16 md:h-20 w-auto object-contain"
                priority
              />
            ) : (
              <div className="flex flex-col items-center">
                {/* Decorative Top Accent */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="h-[1px] w-8 md:w-16 bg-[#C8102E]/40"></span>
                  <span className="text-[10px] md:text-xs font-semibold text-[#B8860B] uppercase tracking-widest">
                    জাতীয় দৈনিক সংবাদপত্র
                  </span>
                  <span className="h-[1px] w-8 md:w-16 bg-[#C8102E]/40"></span>
                </div>

                {/* Main Newspaper Name */}
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-[#C8102E] tracking-tight group-hover:text-[#A50E26] transition-colors leading-none"
                  style={{
                    fontFamily: "var(--font-noto-bengali), var(--font-bengali), sans-serif",
                    textShadow: "0 1px 1px rgba(0,0,0,0.05)",
                  }}
                >
                  {settings.siteName || "দৈনিক বাংলাদেশ বার্তা"}
                </h1>

                {/* Newspaper Slogan and Est. */}
                <div className="flex items-center gap-3 mt-2 text-xs md:text-sm text-[var(--color-text-muted)] border-t border-b border-[#C8102E]/20 py-0.5 px-4">
                  <span>{settings.siteSlogan || "সত্য ও সাহসের পক্ষে অবিচল"}</span>
                  <span className="text-[var(--color-border-strong)]">•</span>
                  <span className="text-[11px] font-medium text-[var(--color-text-faint)]">
                    প্রতিষ্ঠিত ২০২৬
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Right Side: E-Paper & Header Banner */}
        <div className="flex items-center gap-3 justify-end w-full md:w-auto lg:w-64">
          <Link
            href="/epaper"
            className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#C8102E] font-bold text-xs rounded border border-[#FECACA] transition-all shadow-xs"
          >
            <Newspaper size={16} />
            <span>আজকের ই-পেপার</span>
          </Link>
          <Link
            href="/latest"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)] font-medium text-xs rounded border border-[var(--color-border)] transition-all"
          >
            <CalendarDays size={14} className="text-[#C8102E]" />
            <span>সর্বশেষ খবর</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
