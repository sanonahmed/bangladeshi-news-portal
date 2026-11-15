import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import type { AdminDashboardProps } from "./types";

export function LiveDesk({
  items,
  activeCount,
}: {
  items: AdminDashboardProps["activeBreakingList"];
  activeCount: number;
}) {
  const { t, formatNumber, language } = useAdminLanguage();
  const isEn = language === "en";
  return (
    <section className="overflow-hidden rounded-2xl border border-rose-950/20 bg-[linear-gradient(145deg,#291519_0%,#1b171c_100%)] text-white shadow-[0_8px_24px_-16px_rgba(127,29,29,0.45)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
            <Zap size={16} />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rose-300">
              {isEn ? "Live desk" : "লাইভ ডেস্ক"}
            </p>
            <h2 className="text-sm font-bold">{t("widget.activeBreaking")}</h2>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-300">
          <span
            className={`size-1.5 rounded-full ${items.length ? "bg-rose-400" : "bg-slate-500"}`}
          />
          {formatNumber(activeCount)}
        </span>
      </div>
      {items.length ? (
        <div className="divide-y divide-white/[0.07] px-5">
          {items.map((item, index) => (
            <div key={item.id} className="py-4">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-rose-300/80">
                <span>
                  {isEn
                    ? `Alert ${index + 1}`
                    : `সংবাদ ${formatNumber(index + 1)}`}
                </span>
                <span className="text-white/20">/</span>
                <span className="text-slate-400">
                  {t("widget.priority")} {formatNumber(item.priority)}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs font-medium leading-relaxed text-slate-100">
                {item.headline}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <Zap size={22} className="mx-auto text-slate-500" />
          <p className="mt-3 text-xs text-slate-400">
            {t("widget.noBreaking")}
          </p>
        </div>
      )}
      <div className="border-t border-white/10 bg-black/10 px-5 py-3">
        <Link
          href="/admin/breaking-news"
          className="flex items-center justify-between text-xs font-semibold text-rose-200 transition-colors hover:text-white"
        >
          {t("stat.manage")}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
