"use client";

import { useState } from "react";
import {
  Activity,
  Flame,
  Award,
  CircleDot,
  Radio,
  Clock,
  Sparkles,
} from "lucide-react";
import type { LiveMatch, CricketBatsman, CricketBowler } from "@/lib/sports-data";
import { toBengaliDigits } from "@/lib/bengali-date";

interface CricketScorecardViewProps {
  match: LiveMatch;
}

export function CricketScorecardView({ match }: CricketScorecardViewProps) {
  const [activeTab, setActiveTab] = useState<"commentary" | "scorecard">("commentary");
  const [scorecardInning, setScorecardInning] = useState<"team1" | "team2">("team2");

  const recentBalls = match.recentBalls || ["1", "4", "0", "W", "6", "2"];
  const batsmen = match.currentBatsmen || [];
  const bowlers = match.currentBowlers || [];
  const commentaryList = match.commentary || [];

  const getBallStyle = (ball: string) => {
    if (ball === "W" || ball === "w") return "bg-red-600 text-white font-extrabold border-red-700";
    if (ball === "6") return "bg-purple-600 text-white font-extrabold border-purple-700";
    if (ball === "4") return "bg-emerald-600 text-white font-extrabold border-emerald-700";
    if (ball === "0") return "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700";
    return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* 1. CURRENT ON-CREASE BATSMEN & BOWLER BAR */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Batsmen Table */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2 mb-2">
            <span>ক্রিজে থাকা ব্যাটসম্যান</span>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <span className="w-8 text-right">রান</span>
              <span className="w-8 text-right">বল</span>
              <span className="w-6 text-right">৪</span>
              <span className="w-6 text-right">৬</span>
              <span className="w-14 text-right">স্ট্রাইক রেট</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {batsmen.map((b, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 text-xs transition-colors ${
                  b.isOnStrike
                    ? "bg-red-50/70 dark:bg-red-950/20 font-bold border-l-4 border-[var(--color-primary)]"
                    : "text-[var(--color-text)]"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{b.name}</span>
                  {b.isOnStrike && (
                    <span className="text-[10px] text-[var(--color-primary)] font-bold animate-pulse">
                      *
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400 font-normal">
                    ({b.outStatus || "অপরাজিত"})
                  </span>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <span className="w-8 text-right font-bold text-[var(--color-primary)]">
                    {toBengaliDigits(b.runs)}
                  </span>
                  <span className="w-8 text-right text-[var(--color-text-muted)]">
                    {toBengaliDigits(b.balls)}
                  </span>
                  <span className="w-6 text-right text-[var(--color-text-muted)]">
                    {toBengaliDigits(b.fours)}
                  </span>
                  <span className="w-6 text-right text-[var(--color-text-muted)]">
                    {toBengaliDigits(b.sixes)}
                  </span>
                  <span className="w-14 text-right font-semibold">
                    {toBengaliDigits(b.strikeRate.toFixed(1))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bowler & Over sequence */}
        <div className="pt-3 border-t border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Current Bowler */}
          {bowlers[0] && (
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-[var(--color-text)]">
                বোলিং: {bowlers[0].name}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 border border-[var(--color-border)]">
                {toBengaliDigits(bowlers[0].overs)}-{toBengaliDigits(bowlers[0].maidens)}-{toBengaliDigits(bowlers[0].runs)}-{toBengaliDigits(bowlers[0].wickets)} (ইকো: {toBengaliDigits(bowlers[0].economy.toFixed(1))})
              </span>
            </div>
          )}

          {/* Recent balls visual */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--color-text-muted)] font-bold text-[11px] mr-1">
              বর্তমান ওভার:
            </span>
            <div className="flex items-center gap-1">
              {recentBalls.map((ball, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono shadow-xs ${getBallStyle(
                    ball
                  )}`}
                >
                  {toBengaliDigits(ball)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Partnership & Run Rates summary */}
        <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          {match.currentPartnership && (
            <span>
              বর্তমান জুটি: <strong className="text-[var(--color-text)]">{match.currentPartnership}</strong>
            </span>
          )}
          <div className="flex items-center gap-4 font-mono text-xs">
            {match.crr && (
              <span>
                CRR: <strong className="text-[var(--color-text)]">{toBengaliDigits(match.crr.toFixed(2))}</strong>
              </span>
            )}
            {match.rrr && (
              <span className="text-[var(--color-primary)] font-bold">
                RRR: {toBengaliDigits(match.rrr.toFixed(2))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("commentary")}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "commentary"
              ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>বল-বাই-বল লাইভ ধারাভাষ্য</span>
        </button>
        <button
          onClick={() => setActiveTab("scorecard")}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "scorecard"
              ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>পূর্ণাঙ্গ স্কোরকার্ড</span>
        </button>
      </div>

      {/* 3. TAB 1: BALL-BY-BALL COMMENTARY FEED */}
      {activeTab === "commentary" && (
        <div className="space-y-3">
          {commentaryList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
              ধারভাষ্য লোড হচ্ছে...
            </div>
          ) : (
            commentaryList.map((c) => (
              <div
                key={c.id}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-xs flex items-start gap-3.5 transition-all hover:border-[var(--color-border-strong)]"
              >
                {/* Over pill */}
                <div className="shrink-0 text-center">
                  <span className="bg-zinc-800 text-white font-mono font-bold text-xs px-2 py-1 rounded block mb-1">
                    {c.over}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                      c.ballType === "four"
                        ? "bg-emerald-600 text-white"
                        : c.ballType === "six"
                        ? "bg-purple-600 text-white"
                        : c.ballType === "wicket"
                        ? "bg-red-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {c.ballType === "four" ? "৪" : c.ballType === "six" ? "৬" : c.ballType === "wicket" ? "W" : "•"}
                  </span>
                </div>

                {/* Commentary Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-bold ${
                        c.ballType === "four"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : c.ballType === "six"
                          ? "text-purple-600 dark:text-purple-400"
                          : c.ballType === "wicket"
                          ? "text-red-600 dark:text-red-400"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {c.eventText}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--color-text)]">
                    {c.commentary}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. TAB 2: FULL SCORECARD */}
      {activeTab === "scorecard" && match.battingScorecard && (
        <div className="space-y-6">
          {/* Inning Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScorecardInning("team2")}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                scorecardInning === "team2"
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {match.team2.name} ইনিংস ({match.team2.score})
            </button>
            <button
              onClick={() => setScorecardInning("team1")}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                scorecardInning === "team1"
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {match.team1.name} ইনিংস ({match.team1.score})
            </button>
          </div>

          {/* Batting Table */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-primary)] mb-3">
              ব্যাটিং স্কোরকার্ড
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] pb-2 font-bold">
                    <th className="py-2">ব্যাটসম্যান</th>
                    <th className="py-2">আউট বিবরণ</th>
                    <th className="py-2 text-right">রান</th>
                    <th className="py-2 text-right">বল</th>
                    <th className="py-2 text-right">৪</th>
                    <th className="py-2 text-right">৬</th>
                    <th className="py-2 text-right">স্ট্রাইক রেট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {match.battingScorecard[scorecardInning].map((b, i) => (
                    <tr key={i} className="hover:bg-[var(--color-bg-secondary)]">
                      <td className="py-2.5 font-bold text-[var(--color-text)]">{b.name}</td>
                      <td className="py-2.5 text-[var(--color-text-muted)]">{b.outStatus || "অপরাজিত"}</td>
                      <td className="py-2.5 text-right font-bold text-[var(--color-primary)] font-mono">{toBengaliDigits(b.runs)}</td>
                      <td className="py-2.5 text-right text-[var(--color-text-muted)] font-mono">{toBengaliDigits(b.balls)}</td>
                      <td className="py-2.5 text-right text-[var(--color-text-muted)] font-mono">{toBengaliDigits(b.fours)}</td>
                      <td className="py-2.5 text-right text-[var(--color-text-muted)] font-mono">{toBengaliDigits(b.sixes)}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">{toBengaliDigits(b.strikeRate.toFixed(1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Table */}
          {match.bowlingScorecard && match.bowlingScorecard[scorecardInning === "team2" ? "team2" : "team1"] && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-primary)] mb-3">
                বোলিং ফিগার
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] pb-2 font-bold">
                      <th className="py-2">বোলার</th>
                      <th className="py-2 text-right">ওভার</th>
                      <th className="py-2 text-right">মেইডেন</th>
                      <th className="py-2 text-right">রান</th>
                      <th className="py-2 text-right">উইকেট</th>
                      <th className="py-2 text-right">ইকোনমি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {match.bowlingScorecard[scorecardInning === "team2" ? "team2" : "team1"].map((b, i) => (
                      <tr key={i} className="hover:bg-[var(--color-bg-secondary)]">
                        <td className="py-2.5 font-bold text-[var(--color-text)]">{b.name}</td>
                        <td className="py-2.5 text-right font-mono">{toBengaliDigits(b.overs)}</td>
                        <td className="py-2.5 text-right font-mono text-[var(--color-text-muted)]">{toBengaliDigits(b.maidens)}</td>
                        <td className="py-2.5 text-right font-mono">{toBengaliDigits(b.runs)}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-600 font-mono">{toBengaliDigits(b.wickets)}</td>
                        <td className="py-2.5 text-right font-mono font-semibold">{toBengaliDigits(b.economy.toFixed(1))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
