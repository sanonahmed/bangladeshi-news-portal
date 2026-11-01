"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  Sparkles,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, WhatsAppIcon } from "@/components/ui/icons";
import { DebateVoteCard } from "@/components/public/debates/DebateVoteCard";
import { DebateArenaView } from "@/components/public/debates/DebateArenaView";
import { SubmitArgumentModal } from "@/components/public/debates/SubmitArgumentModal";
import type { DebateDetail } from "@/actions/debates";
import type { DebateArgument } from "@/db/schema/polls";
import { toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";

interface DebateDetailClientProps {
  initialData: DebateDetail;
}

export function DebateDetailClient({ initialData }: DebateDetailClientProps) {
  const { poll } = initialData;
  const [forArgs, setForArgs] = useState<DebateArgument[]>(initialData.forArguments);
  const [againstArgs, setAgainstArgs] = useState<DebateArgument[]>(initialData.againstArguments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSide, setModalSide] = useState<"for" | "against">("for");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenModal = (side: "for" | "against") => {
    setModalSide(side);
    setIsModalOpen(true);
  };

  const handleNewArgument = (newArg: DebateArgument) => {
    if (newArg.side === "for") {
      setForArgs((prev) => [newArg, ...prev]);
    } else {
      setAgainstArgs((prev) => [newArg, ...prev]);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const totalArguments = forArgs.length + againstArgs.length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[var(--color-text-muted)] flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
          <span>/</span>
          <Link href="/debates" className="hover:text-[var(--color-primary)]">মতামত ও বিতর্ক ফোরাম</Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold truncate max-w-[250px]">{poll.category}</span>
        </div>

        <Link
          href="/debates"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল বিতর্ক দেখুন</span>
        </Link>
      </nav>

      {/* Main Debate Header Card */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-0.5 bg-[var(--color-primary)] text-white uppercase tracking-wider">
            {poll.category}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 border ${
              poll.isActive
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {poll.isActive ? "● চলমান জাতীয় বিতর্ক" : "○ সম্পন্ন বিতর্ক"}
          </span>
          {poll.isFeatured && (
            <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              সাপ্তাহিক প্রধান বিতর্ক
            </span>
          )}
        </div>

        <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] leading-tight mb-4">
          {poll.question}
        </h1>

        {poll.description && (
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed mb-6">
            {poll.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
            শুরু: {formatBengaliDate(new Date(poll.createdAt))}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-[var(--color-primary)]" />
            মোট ভোটার: <strong className="text-[var(--color-text)]">{toBengaliDigits(poll.totalVotes)} জন</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
            যুক্তি জমা পড়েছে: <strong className="text-[var(--color-text)]">{toBengaliDigits(totalArguments)} টি</strong>
          </span>
        </div>
      </div>

      {/* TOPIC CONTEXT / BACKGROUND BOX */}
      {poll.topicContext && (
        <div className="bg-[var(--color-bg-secondary)] border-l-4 border-[#B8860B] p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#B8860B] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>বিতর্কের প্রেক্ষাপট ও অনুসন্ধানী পটভূমি</span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text)] whitespace-pre-line">
            {poll.topicContext}
          </p>
        </div>
      )}

      {/* LIVE VOTING CARD */}
      <DebateVoteCard
        pollId={poll.id}
        question={poll.question}
        options={poll.options}
        initialVotes={poll.votes}
        initialTotalVotes={poll.totalVotes}
        isActive={poll.isActive}
      />

      {/* SIDE-BY-SIDE DEBATE ARENA */}
      <DebateArenaView
        pollId={poll.id}
        forArguments={forArgs}
        againstArguments={againstArgs}
        onOpenSubmitModal={handleOpenModal}
        isActive={poll.isActive}
      />

      {/* EDITORIAL SUMMARY & CONCLUSION */}
      {poll.editorialSummary && (
        <div className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>দৈনিক বাংলাদেশ বার্তা সম্পাদকীয় পর্যালোচনা</span>
          </div>
          <h3 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)]">
            জনমতের গতিপ্রকৃতি ও সারসংক্ষেপ
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
            {poll.editorialSummary}
          </p>
        </div>
      )}

      {/* SOCIAL SHARING BAR */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
          <Share2 className="w-4 h-4 text-[var(--color-primary)]" />
          <span>এই বিতর্কটি সামাজিক যোগাযোগ মাধ্যমে শেয়ার করুন:</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-border)] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
            title="Facebook এ শেয়ার করুন"
          >
            <FacebookIcon size={14} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(poll.question)}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-border)] hover:bg-black hover:text-white hover:border-black transition-colors"
            title="X (Twitter) এ শেয়ার করুন"
          >
            <TwitterXIcon size={14} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(poll.question + " - " + currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-border)] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
            title="WhatsApp এ শেয়ার করুন"
          >
            <WhatsAppIcon size={14} />
          </a>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            title="লিংক কপি করুন"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "কপি হয়েছে!" : "লিংক কপি"}</span>
          </button>
        </div>
      </div>

      {/* SUBMISSION MODAL */}
      <SubmitArgumentModal
        pollId={poll.id}
        initialSide={modalSide}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewArgument}
      />
    </div>
  );
}
