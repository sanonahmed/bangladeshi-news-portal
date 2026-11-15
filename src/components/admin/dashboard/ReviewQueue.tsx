import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock3 } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { dashboardPercentage, type AdminDashboardProps } from "./types";
import { PanelHeader, SURFACE } from "./DashboardPrimitives";

export function ReviewQueue({
  pending,
  pendingCount,
  publishedCount,
}: {
  pending: AdminDashboardProps["pendingReviews"];
  pendingCount: number;
  publishedCount: number;
}) {
  const { t, formatNumber, formatDateString, language } = useAdminLanguage();
  const isEn = language === "en";
  const percentage = dashboardPercentage(
    pendingCount,
    pendingCount + publishedCount,
  );
  return (
    <section className={`overflow-hidden ${SURFACE}`}>
      <PanelHeader
        icon={Clock3}
        eyebrow={isEn ? "Action required" : "পদক্ষেপ প্রয়োজন"}
        title={t("section.pendingQueue")}
        href="/admin/reviews"
        action={t("stat.approve")}
      />
      {pending.length ? (
        <div className="divide-y divide-[var(--color-border)] px-5">
          {pending.map((article) => (
            <Link
              href={`/admin/reviews?article=${article.id}`}
              key={article.id}
              className="group flex gap-3 py-4"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-xs font-semibold leading-relaxed text-[var(--color-text)] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {article.title}
                </span>
                <span className="mt-1.5 block text-[10px] text-slate-400">
                  {t("label.submittedAt")} ·{" "}
                  {formatDateString(article.createdAt)}
                </span>
              </span>
              <ChevronRight
                size={14}
                className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-5 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20">
            <CheckCircle2 size={22} />
          </span>
          <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isEn ? "Your review queue is clear" : "পর্যালোচনার তালিকা খালি"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            {t("section.noPending")}
          </p>
        </div>
      )}
      <div className="border-t border-[var(--color-border)] bg-slate-50/60 px-5 py-3 dark:bg-white/[0.025]">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {isEn ? "Published vs pending" : "প্রকাশিত বনাম অপেক্ষমাণ"}
          </span>
          <span className="font-medium text-slate-500 dark:text-slate-300">
            {formatNumber(percentage)}%
          </span>
        </div>
      </div>
    </section>
  );
}
