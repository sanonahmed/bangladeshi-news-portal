"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  Sparkles,
  ListMusic,
  ExternalLink,
  Clock,
  Radio,
} from "lucide-react";
import {
  cleanHtmlToText,
  splitIntoSentences,
  estimateAudioDuration,
  formatDigitalTimeBengali,
  formatDurationBengali,
} from "@/lib/tts-extractor";
import { toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";
import type { AudioNewsTrack } from "@/actions/audio-news";

interface AudioNewsHubClientProps {
  initialPlaylist: AudioNewsTrack[];
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioNewsHubClient({ initialPlaylist }: AudioNewsHubClientProps) {
  const [tracks, setTracks] = useState<AudioNewsTrack[]>(initialPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const volumeRef = useRef<number>(1.0);
  const activeTrackRef = useRef<number>(0);

  // Filtered tracks by category
  const filteredTracks = useMemo(() => {
    if (selectedCategory === "all") return tracks;
    return tracks.filter((t) => t.category === selectedCategory);
  }, [tracks, selectedCategory]);

  const activeTrack = filteredTracks[currentTrackIndex] || filteredTracks[0] || tracks[0];

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set(tracks.map((t) => t.category));
    return ["all", ...Array.from(set)];
  }, [tracks]);

  // Total playlist duration
  const totalPlaylistSeconds = useMemo(() => {
    return filteredTracks.reduce((acc, t) => acc + t.durationSeconds, 0);
  }, [filteredTracks]);

  // Sentences for active track
  const activeSentences = useMemo(() => {
    if (!activeTrack) return [];
    const cleanBody = cleanHtmlToText(activeTrack.content || activeTrack.excerpt);
    const fullText = `${activeTrack.title}। ${activeTrack.author}-এর প্রতিবেদন। ${cleanBody}`;
    return splitIntoSentences(fullText);
  }, [activeTrack]);

  // Keep refs in sync
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    volumeRef.current = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    activeTrackRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak a sentence chunk
  const speakSentence = useCallback(
    (sentenceIdx: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;

      if (sentenceIdx >= activeSentences.length) {
        // Track completed!
        if (autoPlayNext && currentTrackIndex + 1 < filteredTracks.length) {
          // Advance to next track
          const nextTrackIdx = currentTrackIndex + 1;
          setCurrentTrackIndex(nextTrackIdx);
          setCurrentSentenceIndex(0);
          // Small timeout before next track starts
          setTimeout(() => {
            speakSentence(0);
          }, 600);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentSentenceIndex(0);
          isSpeakingRef.current = false;
        }
        return;
      }

      synth.cancel();

      const text = activeSentences[sentenceIdx];
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "bn-BD";
      utterance.rate = speedRef.current;
      utterance.volume = volumeRef.current;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setCurrentSentenceIndex(sentenceIdx);
      };

      utterance.onend = () => {
        if (isSpeakingRef.current && !synth.paused) {
          speakSentence(sentenceIdx + 1);
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("TTS Error:", e);
        }
        if (isSpeakingRef.current && sentenceIdx + 1 < activeSentences.length) {
          speakSentence(sentenceIdx + 1);
        } else {
          setIsPlaying(false);
          isSpeakingRef.current = false;
        }
      };

      synth.speak(utterance);
    },
    [activeSentences, autoPlayNext, currentTrackIndex, filteredTracks.length]
  );

  // Play / Pause
  const handleTogglePlay = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isSpeakingRef.current = true;
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      isSpeakingRef.current = true;
      speakSentence(currentSentenceIndex);
    }
  };

  // Stop
  const handleStop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
  };

  // Switch Track
  const handleSelectTrack = (idx: number) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTrackIndex(idx);
    setCurrentSentenceIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
    isSpeakingRef.current = true;
    // speakSentence will trigger after activeSentences recomputed
  };

  // Effect to start speaking if track index changed while playing
  useEffect(() => {
    if (isPlaying && isSpeakingRef.current) {
      speakSentence(0);
    }
  }, [currentTrackIndex, speakSentence]);

  // Next Track
  const handleNextTrack = () => {
    if (currentTrackIndex + 1 < filteredTracks.length) {
      handleSelectTrack(currentTrackIndex + 1);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    if (currentTrackIndex > 0) {
      handleSelectTrack(currentTrackIndex - 1);
    }
  };

  // Skip Forward in current track
  const handleForward = () => {
    const nextIdx = Math.min(activeSentences.length - 1, currentSentenceIndex + 2);
    setCurrentSentenceIndex(nextIdx);
    if (isPlaying) speakSentence(nextIdx);
  };

  // Skip Rewind in current track
  const handleRewind = () => {
    const prevIdx = Math.max(0, currentSentenceIndex - 2);
    setCurrentSentenceIndex(prevIdx);
    if (isPlaying) speakSentence(prevIdx);
  };

  // Speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      speakSentence(currentSentenceIndex);
    }
  };

  // Progress metrics for active track
  const progressPercent =
    activeSentences.length > 0
      ? ((currentSentenceIndex + 1) / activeSentences.length) * 100
      : 0;
  const activeElapsedSeconds = Math.round(
    (progressPercent / 100) * (activeTrack?.durationSeconds || 60)
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          হোম
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">অডিও নিউজ ও পডকাস্ট হাব</span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-r from-red-700 via-rose-800 to-stone-900 p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white mb-3">
            <Radio size={15} className="text-red-400 animate-pulse" />
            <span>দৈনিক বাংলাদেশ বার্তা ভয়েস বুলেটিন</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            অডিও নিউজ ও ধারাবাহিক সংবাদ প্লেয়ার
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            কাজের ফাঁকে বা ভ্রমণের সময় চোখ না রেখেও একনাগাড়ে শুনুন আজকের সেরা সংবাদসমূহ। প্রতিটি খবরের সারসংক্ষেপ ও বিস্তারিত ধারাবাহিক প্লেলিস্টের মাধ্যমে অডিও আকারে শুনুন।
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/80">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
              <ListMusic size={15} className="text-red-400" />
              <span>মোট সংবাদ: {toBengaliDigits(filteredTracks.length)} টি</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={15} className="text-amber-400" />
              <span>মোট শোনার সময়: {formatDurationBengali(totalPlaylistSeconds)}</span>
            </div>
          </div>
        </div>

        <Headphones
          size={300}
          className="absolute -right-10 -bottom-16 text-white/5 pointer-events-none select-none"
        />
      </div>

      {/* Master Audio Player Section */}
      {activeTrack && (
        <div className="rounded-3xl border-2 border-[var(--color-primary)]/40 bg-[var(--color-bg)] p-5 sm:p-7 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-[var(--color-border)]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl bg-stone-900 overflow-hidden shadow-md">
                {activeTrack.featuredImageUrl ? (
                  <img
                    src={activeTrack.featuredImageUrl}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <Headphones size={32} />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-red-600/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="flex items-center gap-0.5">
                      <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                    {activeTrack.category}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    ট্র্যাক {toBengaliDigits(currentTrackIndex + 1)} / {toBengaliDigits(filteredTracks.length)}
                  </span>
                </div>

                <Link href={`/news/${activeTrack.slug}`}>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors leading-snug line-clamp-2">
                    {activeTrack.title}
                  </h2>
                </Link>

                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  প্রতিবেদক: {activeTrack.author} • {activeTrack.estimatedDuration}
                </p>
              </div>
            </div>

            {/* Speeds & AutoPlay Toggle */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(e) => setAutoPlayNext(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="hidden sm:inline">স্বয়ংক্রিয় পরবর্তী সংবাদ</span>
              </label>

              <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5 text-xs">
                {PLAYBACK_SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-1 rounded-lg font-bold transition-colors text-xs ${
                      speed === s
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {toBengaliDigits(s)}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="relative h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
              <span>{formatDigitalTimeBengali(activeElapsedSeconds)}</span>
              <span className="text-[11px] italic text-[var(--color-text)] truncate max-w-md hidden md:inline">
                {activeSentences[currentSentenceIndex] ? `"${activeSentences[currentSentenceIndex]}"` : ""}
              </span>
              <span>{formatDigitalTimeBengali(activeTrack.durationSeconds)}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {/* Playback buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handlePrevTrack}
                disabled={currentTrackIndex === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
                title="পূর্ববর্তী সংবাদ"
              >
                <SkipBack size={15} />
              </button>

              <button
                type="button"
                onClick={handleRewind}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                title="১০ সেকেন্ড পেছনে"
              >
                <RotateCcw size={15} />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-95 ${
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[var(--color-primary)] hover:opacity-90"
                }`}
                title={isPlaying ? "পজ করুন" : "প্লে করুন"}
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleForward}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                title="১০ সেকেন্ড সামনে"
              >
                <RotateCw size={15} />
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                disabled={currentTrackIndex >= filteredTracks.length - 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
                title="পরবর্তী সংবাদ"
              >
                <SkipForward size={15} />
              </button>

              {(isPlaying || isPaused) && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
                  title="বন্ধ করুন"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              )}
            </div>

            {/* Volume & Full Article Link */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 hover:text-[var(--color-text)] transition-colors"
                  title={isMuted ? "সাউন্ড অন করুন" : "মিউট করুন"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-16 accent-[var(--color-primary)] cursor-pointer"
                />
              </div>

              <Link
                href={`/news/${activeTrack.slug}`}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span>সম্পূর্ণ লেখা পড়ুন</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`rounded-xl px-4 py-2 font-bold transition-all flex-shrink-0 ${
            selectedCategory === "all"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          সকল সংবাদ ({toBengaliDigits(tracks.length)})
        </button>

        {categories
          .filter((c) => c !== "all")
          .map((cat) => {
            const count = tracks.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 font-bold transition-all flex-shrink-0 border ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white border-transparent shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {cat} ({toBengaliDigits(count)})
              </button>
            );
          })}
      </div>

      {/* Playlist Tracks List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
          <ListMusic size={18} className="text-[var(--color-primary)]" />
          <span>প্লেলিস্টের সংবাদসমূহ</span>
        </h3>

        {filteredTracks.map((track, idx) => {
          const isCurrent = activeTrack?.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handleSelectTrack(idx)}
              className={`group flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)] shadow-sm"
                  : "border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Index / Play button indicator */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                    isCurrent
                      ? "bg-red-600 text-white"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)] group-hover:text-white"
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <span className="flex items-center gap-0.5">
                      <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : (
                    <span>{toBengaliDigits(idx + 1)}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)] border border-[var(--color-border)]">
                      {track.category}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {track.author}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--color-text)] truncate leading-snug">
                    {track.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                    {track.excerpt}
                  </p>
                </div>
              </div>

              {/* Right meta */}
              <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  {track.estimatedDuration}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTrack(idx);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform active:scale-95 ${
                    isCurrent && isPlaying ? "bg-red-600" : "bg-[var(--color-primary)]"
                  }`}
                  title={isCurrent && isPlaying ? "পজ করুন" : "শুনুন"}
                >
                  {isCurrent && isPlaying ? (
                    <Pause size={13} fill="currentColor" />
                  ) : (
                    <Play size={13} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
