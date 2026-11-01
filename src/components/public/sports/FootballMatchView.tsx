"use client";

import {
  Activity,
  Flame,
  Clock,
  Shield,
  Goal,
} from "lucide-react";
import type { LiveMatch } from "@/lib/sports-data";
import { toBengaliDigits } from "@/lib/bengali-date";

interface FootballMatchViewProps {
  match: LiveMatch;
}

export function FootballMatchView({ match }: FootballMatchViewProps) {
  const goals = match.footballGoals || [];
  const stats = match.footballStats || [];
  const commentaryList = match.commentary || [];

  return (
    <div className="space-y-6">
      {/* 1. GOAL TIMELINE & SCORERS BOX */}
      {goals.length > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-3 flex items-center gap-1.5">
            <span>⚽ গোল ও প্রধান ঘটনাবলী</span>
          </h4>

          <div className="space-y-2">
            {goals.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded text-[10px]">
                    {toBengaliDigits(g.minute)}&apos;
                  </span>
                  <span className="font-bold text-[var(--color-text)]">
                    {g.player}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    ({g.team === "team1" ? match.team1.name : match.team2.name})
                  </span>
                </div>

                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  ⚽ গোল
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MATCH STATS COMPARISON */}
      {stats.length > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold mb-4 pb-2 border-b border-[var(--color-border)]">
            <span className="text-blue-600 dark:text-blue-400">{match.team1.name}</span>
            <span className="text-[var(--color-text-muted)] uppercase tracking-wider">ম্যাচ পরিসংখ্যান</span>
            <span className="text-emerald-600 dark:text-emerald-400">{match.team2.name}</span>
          </div>

          <div className="space-y-4">
            {stats.map((s, idx) => {
              const val1 = typeof s.team1Value === "number" ? s.team1Value : parseInt(String(s.team1Value)) || 50;
              const val2 = typeof s.team2Value === "number" ? s.team2Value : parseInt(String(s.team2Value)) || 50;
              const total = Math.max(1, val1 + val2);
              const pct1 = Math.round((val1 / total) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
                    <span className="font-mono">{toBengaliDigits(s.team1Value)}</span>
                    <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                      {s.label}
                    </span>
                    <span className="font-mono">{toBengaliDigits(s.team2Value)}</span>
                  </div>

                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 flex overflow-hidden">
                    <div
                      className="bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct1}%` }}
                    />
                    <div
                      className="bg-emerald-600 transition-all duration-500"
                      style={{ width: `${100 - pct1}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LIVE COMMENTARY FEED */}
      {commentaryList.length > 0 && (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>লাইভ ধারাভাষ্য ও মিনিট-বাই-মিনিট আপডেট</span>
          </h4>

          <div className="space-y-3">
            {commentaryList.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-start gap-3"
              >
                <span className="bg-zinc-800 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded shrink-0">
                  {c.over}
                </span>

                <div className="flex-1">
                  <div className="font-bold text-xs text-[var(--color-text)] mb-0.5">
                    {c.eventText}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {c.commentary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
