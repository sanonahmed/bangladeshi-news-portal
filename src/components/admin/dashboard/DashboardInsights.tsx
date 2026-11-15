import { BarChart3, Vote } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { dashboardPercentage, type AdminDashboardProps } from "./types";
import { PanelHeader, SURFACE } from "./DashboardPrimitives";

export function DashboardInsights({
  poll,
  categories,
  enabledPolls,
}: {
  poll: AdminDashboardProps["featuredPoll"];
  categories: AdminDashboardProps["categoryBreakdown"];
  enabledPolls: boolean;
}) {
  const { t, formatNumber, language } = useAdminLanguage();
  const total = categories.reduce((sum, category) => sum + category.count, 0);
  const options = Array.isArray(poll?.options) ? poll.options.slice(0, 4) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {enabledPolls && (
        <section className={`overflow-hidden ${SURFACE}`}>
          <PanelHeader
            icon={Vote}
            eyebrow={
              language === "en" ? "Audience engagement" : "পাঠকের অংশগ্রহণ"
            }
            title={t("widget.activePoll")}
            href="/admin/polls"
            action={t("widget.allPolls")}
          />
          {poll ? (
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold leading-relaxed text-[var(--color-text)]">
                  {poll.question}
                </h3>
                <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                  {formatNumber(poll.totalVotes)} {t("widget.totalVotes")}
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {options.map((option, index) => {
                  const votes = Array.isArray(poll.votes)
                    ? Number(poll.votes[index] ?? 0)
                    : 0;
                  const percentage = dashboardPercentage(
                    votes,
                    poll.totalVotes,
                  );
                  return (
                    <div key={`${option}-${index}`}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                        <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                          {option}
                        </span>
                        <span className="shrink-0 font-semibold text-[var(--color-text)] tabular-nums">
                          {formatNumber(percentage)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${index === 0 ? "bg-indigo-500" : index === 1 ? "bg-violet-400" : "bg-slate-300 dark:bg-slate-600"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-xs text-slate-400">
              {t("widget.noPolls")}
            </div>
          )}
        </section>
      )}

      <section className={`overflow-hidden ${SURFACE}`}>
        <PanelHeader
          icon={BarChart3}
          eyebrow={
            language === "en" ? "Content portfolio" : "কনটেন্ট পোর্টফোলিও"
          }
          title={t("widget.categories")}
          href="/admin/categories"
          action={t("widget.categoryList")}
        />
        <div className="space-y-4 p-5 sm:p-6">
          {categories.length ? (
            categories.map((category, index) => {
              const percentage = dashboardPercentage(category.count, total);
              return (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {category.name}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {formatNumber(category.count)}{" "}
                      <span className="text-slate-300 dark:text-slate-600">
                        /
                      </span>{" "}
                      {formatNumber(percentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${index === 0 ? "bg-indigo-500" : index === 1 ? "bg-blue-400" : "bg-slate-300 dark:bg-slate-600"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-5 text-center text-xs text-slate-400">
              {t("section.noArticles")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
