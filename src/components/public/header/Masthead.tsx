import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/types";

interface MastheadProps {
  settings: SiteSettings;
}

export function Masthead({ settings }: MastheadProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        {settings.logoUrl ? (
          <Image
            src={settings.logoUrl}
            alt={settings.siteName ?? "সংবাদপত্র"}
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
        ) : (
          <div className="flex flex-col">
            <span
              className="text-4xl font-bold text-[var(--color-primary)] leading-none"
              style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
            >
              {settings.siteName ?? "বাংলা নিউজ"}
            </span>
            {settings.siteSlogan && (
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {settings.siteSlogan}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Advertisement slot — 728×90 leaderboard */}
      <div className="hidden lg:flex items-center">
        <div
          className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-faint)] text-xs"
          style={{ width: 728, height: 90 }}
          aria-label="বিজ্ঞাপন"
        >
          {/* Header ad slot — populated by AdSense or direct ads */}
          <span>বিজ্ঞাপন</span>
        </div>
      </div>
    </div>
  );
}
