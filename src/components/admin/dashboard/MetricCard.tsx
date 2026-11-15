import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

export function MetricCard({
  href,
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(15,23,42,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${accent ? "border-indigo-950 bg-[linear-gradient(135deg,#111c38_0%,#182442_65%,#1d2b4a_100%)] text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.65)]" : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-slate-300 dark:hover:border-slate-600"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-xs font-semibold ${accent ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}
        >
          {label}
        </p>
        <span
          className={`flex size-8 items-center justify-center rounded-lg ${accent ? "bg-white/10 text-indigo-100" : "bg-slate-50 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300"}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">
        {value}
      </p>
      <div
        className={`mt-3 flex items-center justify-between gap-2 text-[11px] ${accent ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"}`}
      >
        <span className="min-w-0 truncate">{detail}</span>
        <ArrowUpRight
          size={14}
          className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      {accent && (
        <span
          aria-hidden="true"
          className="absolute -right-8 -bottom-14 size-32 rounded-full border-[18px] border-white/[0.025]"
        />
      )}
    </Link>
  );
}
