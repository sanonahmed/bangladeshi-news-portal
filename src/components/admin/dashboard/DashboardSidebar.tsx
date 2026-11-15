import Link from "next/link";
import { ArrowUpRight, MessageSquare, type LucideIcon } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import type { AdminDashboardProps } from "./types";
import { ReviewQueue } from "./ReviewQueue";
import { LiveDesk } from "./LiveDesk";
import { SURFACE } from "./DashboardPrimitives";

interface Props {
  pending: AdminDashboardProps["pendingReviews"];
  stats: AdminDashboardProps["stats"];
  breaking: AdminDashboardProps["activeBreakingList"];
  tools: { href: string; icon: LucideIcon; label: string }[];
  enabledComments: boolean;
}

export function DashboardSidebar({
  pending,
  stats,
  breaking,
  tools,
  enabledComments,
}: Props) {
  const { t, formatNumber, language } = useAdminLanguage();
  return (
    <aside className="min-w-0 space-y-6">
      <ReviewQueue
        pending={pending}
        pendingCount={stats.pending}
        publishedCount={stats.published}
      />
      <LiveDesk items={breaking} activeCount={stats.activeBreaking} />
      <section className={`p-5 ${SURFACE}`}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {language === "en" ? "Shortcuts" : "দ্রুত পদক্ষেপ"}
          </p>
          <h2 className="mt-1 text-sm font-bold text-[var(--color-text)]">
            {t("widget.quickTools")}
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {tools.map(({ href, icon: Icon, label }) => (
            <Link
              href={href}
              key={href}
              className="group flex min-h-[82px] flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-white/[0.06] dark:bg-white/[0.025] dark:hover:border-indigo-400/20 dark:hover:bg-indigo-400/[0.07]"
            >
              <Icon
                size={16}
                className="text-slate-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              />
              <span className="mt-2 flex items-center justify-between gap-1 text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                {label}
                <ArrowUpRight size={12} className="shrink-0 text-slate-300" />
              </span>
            </Link>
          ))}
        </div>
        {enabledComments && (
          <Link
            href="/admin/comments"
            className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 transition-colors hover:bg-indigo-50 dark:bg-white/[0.04] dark:text-slate-400"
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={14} />
              {t("widget.comments")}
            </span>
            <span className="font-bold text-[var(--color-text)]">
              {formatNumber(stats.pendingComments)}
            </span>
          </Link>
        )}
      </section>
    </aside>
  );
}
