import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

export const SURFACE =
  "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[0_1px_2px_rgba(15,23,42,0.025)]";

export function PanelHeader({
  eyebrow,
  title,
  href,
  action,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  href: string;
  action: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)] text-slate-500 dark:text-slate-400">
          <Icon size={16} />
        </span>
        <div>
          {eyebrow && (
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {eyebrow}
            </p>
          )}
          <h2 className="text-sm font-bold tracking-tight text-[var(--color-text)]">
            {title}
          </h2>
        </div>
      </div>
      <Link
        href={href}
        className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        {action}
        <ArrowUpRight
          size={13}
          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const color =
    status === "published"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
      : status === "pending_review"
        ? "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
        : "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${color}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
