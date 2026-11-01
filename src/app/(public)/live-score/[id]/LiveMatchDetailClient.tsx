"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Share2,
  Copy,
  Check,
  Radio,
  Clock,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, WhatsAppIcon } from "@/components/ui/icons";
import { CricketScorecardView } from "@/components/public/sports/CricketScorecardView";
import { FootballMatchView } from "@/components/public/sports/FootballMatchView";
import { LiveSimulatorControl } from "@/components/public/sports/LiveSimulatorControl";
import type { LiveMatch, BallCommentary } from "@/lib/sports-data";
import { toBengaliDigits } from "@/lib/bengali-date";

interface LiveMatchDetailClientProps {
  initialMatch: LiveMatch;
}

export function LiveMatchDetailClient({ initialMatch }: LiveMatchDetailClientProps) {
  const [match, setMatch] = useState<LiveMatch>(initialMatch);
  const [copiedLink, setCopiedLink] = useState(false);

  // Simulation: add runs / ball
  const handleSimulateBall = () => {
    if (match.sport === "cricket" && match.status === "live") {
      const outcomes: { run: number; ballType: "normal" | "four" | "six"; text: string; comment: string }[] = [
        { run: 4, ballType: "four", text: "৪ রান!", comment: "কভার দিয়ে চোখধাঁধানো চার হাঁকালেন নাজমুল হোসেন শান্ত! নিখুঁত টাইমিং।" },
        { run: 1, ballType: "normal", text: "১ রান", comment: "মিড-অফে পুশ করে দ্রুতগতিতে ১ রান সম্পন্ন করলেন তাওহীদ হৃদয়।" },
        { run: 6, ballType: "six", text: "বিশাল ছক্কা!", comment: "ডিপ মিড-উইকেটের ওপর দিয়ে অবিশ্বাস্য ছক্কা! স্টেডিয়ামের দর্শক দাঁড়িয়ে করতালিতে মুখরিত।" },
        { run: 2, ballType: "normal", text: "২ রান", comment: "ডিপ স্কয়ার লেগে বল পাঠিয়ে দৌড়ে ২ রান নিলেন শান্ত।" },
      ];

      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]!;
      
      // Update team2 score
      const currentScoreParts = match.team2.score?.split("/") || ["268", "5"];
      const currentRuns = parseInt(currentScoreParts[0] || "268") + outcome.run;
      const currentWickets = currentScoreParts[1] || "5";
      const newScore = `${toBengaliDigits(currentRuns)}/${currentWickets}`;

      // Update commentary
      const newCommentary: BallCommentary = {
        id: `sim-${Date.now()}`,
        over: "৪৬.৩",
        ballType: outcome.ballType,
        eventText: outcome.text,
        commentary: outcome.comment,
        timestamp: "এইমাত্র",
      };

      setMatch((prev) => ({
        ...prev,
        team2: {
          ...prev.team2,
          score: newScore,
          overs: "(৪৬.৩)",
        },
        recentBalls: [String(outcome.run), ...(prev.recentBalls || []).slice(0, 5)],
        commentary: [newCommentary, ...(prev.commentary || [])],
        statusNote: `বাংলাদেশের জয়ের জন্য প্রয়োজন ২১ বলে ${toBengaliDigits(Math.max(1, (prev.target || 287) - currentRuns))} রান`,
      }));
    } else if (match.sport === "football" && match.status === "live") {
      const newMinute = (match.matchMinute || 78) + 1;
      setMatch((prev) => ({
        ...prev,
        matchMinute: newMinute,
        statusNote: `দ্বিতীয়ার্ধের আক্রমণ-পাল্টা আক্রমণ চলছে (${toBengaliDigits(newMinute)}' মিনিট)`,
      }));
    }
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[var(--color-text-muted)] flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
          <span>/</span>
          <Link href="/live-score" className="hover:text-[var(--color-primary)]">লাইভ স্কোরবোর্ড</Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold truncate max-w-[250px]">{match.tournament}</span>
        </div>

        <Link
          href="/live-score"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল লাইভ স্কোর</span>
        </Link>
      </nav>

      {/* MATCH HEADER & SCOREBOARD BANNER */}
      <div className="bg-[#0f1115] text-white border-2 border-zinc-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--color-primary)] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 tracking-wider">
              {match.sport === "cricket" ? "🏏 ক্রিকেট" : "⚽ ফুটবল"}
            </span>
            <span className="font-bold text-zinc-300">{match.tournament}</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">{match.matchLabel}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>{match.venue}</span>
          </div>
        </div>

        {/* Big Scoreboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Team 1 */}
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{match.team1.flag}</span>
              <div>
                <h3 className="font-bold text-base sm:text-xl text-white">{match.team1.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">{match.team1.shortName}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {match.team1.score || "—"}
              </div>
              {match.team1.overs && (
                <div className="text-xs text-zinc-400 font-mono">
                  {match.team1.overs} ওভার
                </div>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{match.team2.flag}</span>
              <div>
                <h3 className="font-bold text-base sm:text-xl text-white">{match.team2.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">{match.team2.shortName}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
                {match.team2.score || "—"}
              </div>
              {match.team2.overs && (
                <div className="text-xs text-zinc-400 font-mono">
                  {match.team2.overs} ওভার
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Note & Toss Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {match.status === "live" && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            )}
            <span className="text-amber-400 font-bold text-sm">
              {match.statusNote}
            </span>
          </div>

          {match.tossInfo && (
            <span className="text-zinc-400 italic">
              {match.tossInfo}
            </span>
          )}
        </div>
      </div>

      {/* LIVE SIMULATOR / REFRESH CONTROLLER */}
      {match.status === "live" && (
        <LiveSimulatorControl
          sport={match.sport}
          onSimulateBall={handleSimulateBall}
          onRefresh={() => {}}
        />
      )}

      {/* SPORT SPECIFIC VIEW: CRICKET OR FOOTBALL */}
      {match.sport === "cricket" ? (
        <CricketScorecardView match={match} />
      ) : (
        <FootballMatchView match={match} />
      )}

      {/* SOCIAL SHARING BAR */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-[var(--color-primary)]" />
          লাইভ স্কোর বন্ধুদের সাথে শেয়ার করুন:
        </span>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border border-[var(--color-border)] hover:bg-[#1877F2] hover:text-white transition-colors"
            title="Facebook এ শেয়ার"
          >
            <FacebookIcon size={13} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${match.team1.name} বনাম ${match.team2.name} লাইভ স্কোর: ${match.statusNote}`)}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border border-[var(--color-border)] hover:bg-black hover:text-white transition-colors"
            title="X (Twitter) এ শেয়ার"
          >
            <TwitterXIcon size={13} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${match.team1.name} বনাম ${match.team2.name} লাইভ স্কোর: ${currentUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border border-[var(--color-border)] hover:bg-[#25D366] hover:text-white transition-colors"
            title="WhatsApp এ শেয়ার"
          >
            <WhatsAppIcon size={13} />
          </a>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] font-semibold transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "কপি হয়েছে!" : "লিংক কপি"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
