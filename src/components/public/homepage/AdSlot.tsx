import Link from "next/link";
import Image from "next/image";
import { getAdForPlacement } from "@/actions/advertisements";
import { getFeatureFlags } from "@/actions/features";
import { AdImpressionTracker } from "./AdImpressionTracker";

interface AdSlotProps {
  placement:
    | "header_banner"
    | "homepage_leaderboard"
    | "sidebar"
    | "between_sections"
    | "article_inline"
    | "mobile_slot"
    | "footer";
  className?: string;
}

export async function AdSlot({ placement, className = "" }: AdSlotProps) {
  const features = await getFeatureFlags();
  if (features.admin_ads_manager === false) {
    return null;
  }

  const ad = await getAdForPlacement(placement);

  // Reserved fixed dimensions preventing Cumulative Layout Shift (CLS)
  const dimensions: Record<string, { width: number; height: number; aspect: string }> = {
    header_banner: { width: 728, height: 90, aspect: "728/90" },
    homepage_leaderboard: { width: 970, height: 90, aspect: "970/90" },
    between_sections: { width: 728, height: 90, aspect: "728/90" },
    sidebar: { width: 300, height: 250, aspect: "300/250" },
    article_inline: { width: 336, height: 280, aspect: "336/280" },
    mobile_slot: { width: 320, height: 100, aspect: "320/100" },
    footer: { width: 728, height: 90, aspect: "728/90" },
  };

  const dim = dimensions[placement] ?? { width: 728, height: 90, aspect: "728/90" };
  const clickRedirectUrl = ad?.id ? `/api/ads/click?id=${ad.id}` : (ad?.destinationUrl ?? "#");

  return (
    <div className={`flex flex-col items-center justify-center my-6 ${className}`} aria-label="বিজ্ঞাপন">
      {ad?.id && <AdImpressionTracker adId={ad.id} />}
      <span className="text-[10px] text-[var(--color-text-faint)] tracking-widest uppercase mb-1">
        বিজ্ঞাপন
      </span>
      <div
        className="w-full max-w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden rounded relative"
        style={{
          width: "100%",
          maxWidth: dim.width,
          minHeight: dim.height,
        }}
        data-ad-placement={placement}
      >
        {ad?.type === "direct_image" && ad.imageUrl ? (
          <Link
            href={clickRedirectUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full h-full relative group"
            style={{ minHeight: dim.height }}
          >
            <div className="relative w-full overflow-hidden" style={{ height: dim.height }}>
              <Image
                src={ad.imageUrl}
                alt={ad.altText ?? "বিজ্ঞাপন ব্যানার"}
                fill
                className="object-cover group-hover:opacity-95 transition-opacity"
                sizes={`(max-width: 768px) 100vw, ${dim.width}px`}
              />
              <span className="absolute bottom-1 right-1.5 bg-black/60 text-[9px] text-white/90 px-1.5 py-0.5 rounded font-sans uppercase">
                স্পন্সরড
              </span>
            </div>
          </Link>
        ) : ad?.type === "adsense" && ad.adCode ? (
          <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
        ) : (
          <div className="text-xs text-[var(--color-text-muted)] py-4 text-center px-4">
            বিজ্ঞাপনের জন্য যোগাযোগ করুন: ads@bangladeshi-news.com
          </div>
        )}
      </div>
    </div>
  );
}
