"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Headphones,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  X,
  ArrowUpCircle,
} from "lucide-react";
import {
  cleanHtmlToText,
  splitIntoSentences,
  estimateAudioDuration,
  formatDigitalTimeBengali,
} from "@/lib/tts-extractor";
import { toBengaliDigits } from "@/lib/bengali-date";

interface ArticleAudioPlayerProps {
  title: string;
  content: string;
  authorName?: string | null;
  newsLocation?: string | null;
  className?: string;
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function ArticleAudioPlayer({
  title,
  content,
  authorName,
  newsLocation,
  className = "",
}: ArticleAudioPlayerProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const [isDockDismissed, setIsDockDismissed] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const currentSentenceRef = useRef(0);
  const speedRef = useRef(1.0);
  const volumeRef = useRef(1.0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Extract clean text and sentences
  const fullText = useMemo(() => {
    const cleanBody = cleanHtmlToText(content);
    const prefix = [
      title,
      authorName ? `${authorName}-এর প্রতিবেদন` : "",
      newsLocation ? `${newsLocation} থেকে` : "",
    ]
      .filter(Boolean)
      .join("। ");
    return `${prefix}। ${cleanBody}`;
  }, [title, content, authorName, newsLocation]);

  const sentences = useMemo(() => {
    return splitIntoSentences(fullText);
  }, [fullText]);

  const { totalSeconds, formatted: estimatedFormatted } = useMemo(() => {
    return estimateAudioDuration(fullText, speed);
  }, [fullText, speed]);

  // Keep refs in sync for event listeners
  useEffect(() => {
    currentSentenceRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    volumeRef.current = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Check speech synthesis support & load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const available = synth.getVoices();
      if (!available || available.length === 0) return;

      setVoices(available);

      // Prioritize Bengali voices (bn-BD, bn-IN, bn)
      const bnVoice = available.find(
        (v) =>
          v.lang.toLowerCase().includes("bn") ||
          v.name.toLowerCase().includes("bengali") ||
          v.name.toLowerCase().includes("bangla")
      );

      // Fallback to Hindi / Indian English / Default
      const fallbackVoice =
        bnVoice ||
        available.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("hi")) ||
        available.find((v) => v.default) ||
        available[0];

      if (fallbackVoice) {
        setSelectedVoice(fallbackVoice);
      }
    };

    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Track scroll position to show floating mini-dock when player scrolls out of view
  useEffect(() => {
    if (!playerContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setShowFloatingDock(!entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(playerContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Speak a specific sentence chunk by index
  const speakSentence = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;

      if (index >= sentences.length) {
        // Finished entire article
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(0);
        isSpeakingRef.current = false;
        return;
      }

      synth.cancel();

      const textToSpeak = sentences[index];
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
        utterance.lang = selectedVoiceRef.current.lang || "bn-BD";
      } else {
        utterance.lang = "bn-BD";
      }

      utterance.rate = speedRef.current;
      utterance.volume = volumeRef.current;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setCurrentSentenceIndex(index);
      };

      utterance.onend = () => {
        if (isSpeakingRef.current && !synth.paused) {
          // Speak next sentence in queue
          speakSentence(index + 1);
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e);
        }
        if (isSpeakingRef.current && index + 1 < sentences.length) {
          speakSentence(index + 1);
        } else {
          setIsPlaying(false);
          isSpeakingRef.current = false;
        }
      };

      synth.speak(utterance);
    },
    [sentences]
  );

  // Play / Resume
  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (isPaused) {
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
  }, [isPaused, currentSentenceIndex, speakSentence]);

  // Pause
  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  // Stop
  const handleStop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    isSpeakingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
  }, []);

  // Skip Forward (+2 sentences)
  const handleForward = useCallback(() => {
    const nextIdx = Math.min(sentences.length - 1, currentSentenceIndex + 2);
    setCurrentSentenceIndex(nextIdx);
    if (isPlaying) {
      speakSentence(nextIdx);
    }
  }, [sentences.length, currentSentenceIndex, isPlaying, speakSentence]);

  // Skip Rewind (-2 sentences)
  const handleRewind = useCallback(() => {
    const prevIdx = Math.max(0, currentSentenceIndex - 2);
    setCurrentSentenceIndex(prevIdx);
    if (isPlaying) {
      speakSentence(prevIdx);
    }
  }, [currentSentenceIndex, isPlaying, speakSentence]);

  // Change Speed
  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      if (isPlaying) {
        // restart current sentence with new rate
        speakSentence(currentSentenceIndex);
      }
    },
    [isPlaying, currentSentenceIndex, speakSentence]
  );

  // Jump to specific sentence on progress bar click
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const fraction = Math.max(0, Math.min(1, clickX / width));
      const targetIndex = Math.floor(fraction * sentences.length);

      setCurrentSentenceIndex(targetIndex);
      if (isPlaying) {
        speakSentence(targetIndex);
      }
    },
    [sentences.length, isPlaying, speakSentence]
  );

  // Scroll to player
  const scrollToPlayer = () => {
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (!isSupported) {
    return null;
  }

  // Progress metrics
  const progressPercent =
    sentences.length > 0 ? ((currentSentenceIndex + 1) / sentences.length) * 100 : 0;
  const currentElapsedSeconds = Math.round((progressPercent / 100) * totalSeconds);

  return (
    <>
      {/* Main Top Audio Player Box */}
      <div
        ref={playerContainerRef}
        className={`my-5 rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg-secondary)] via-[var(--color-bg)] to-[var(--color-bg-secondary)] p-4 sm:p-5 shadow-sm transition-all duration-300 ${className}`}
        role="region"
        aria-label="অডিও নিউজ প্লেয়ার"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          {/* Header left */}
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition-colors ${
                isPlaying ? "bg-red-600 animate-pulse" : "bg-[var(--color-primary)]"
              }`}
            >
              <Headphones size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--color-text)]">
                  সংবাদটি শুনে জেনে নিন (Audio News)
                </h3>
                {isPlaying && (
                  <span className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-0.5 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    <span className="w-0.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:450ms]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                স্বয়ংক্রিয় বাংলা অডিও বাচনভঙ্গি • আনুমানিক সময়: {estimatedFormatted}
              </p>
            </div>
          </div>

          {/* Speed & Voice Selector pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* Speed Buttons */}
            <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-0.5 text-xs">
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors text-[11px] ${
                    speed === s
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                  title={`প্লেব্যাক গতি ${toBengaliDigits(s)}x`}
                >
                  {toBengaliDigits(s)}x
                </button>
              ))}
            </div>

            {/* Voice Dropdown toggle */}
            {voices.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                  title="বাচনভঙ্গি ও ভয়েস পরিবর্তন করুন"
                >
                  <span>ভয়েস</span>
                  <ChevronDown size={12} />
                </button>

                {showVoiceDropdown && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 shadow-xl z-30 text-xs">
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] px-2 py-1 uppercase">
                      উপলব্ধ কণ্ঠস্বর
                    </p>
                    <div className="max-h-44 overflow-y-auto divide-y divide-[var(--color-border)]">
                      {voices.slice(0, 8).map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => {
                            setSelectedVoice(v);
                            setShowVoiceDropdown(false);
                            if (isPlaying) speakSentence(currentSentenceIndex);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded transition-colors text-[11px] truncate ${
                            selectedVoice?.name === v.name
                              ? "bg-[var(--color-primary)] text-white font-bold"
                              : "text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                          }`}
                        >
                          {v.name} ({v.lang})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="mt-3.5 space-y-1.5">
          <div
            onClick={handleProgressClick}
            className="group relative h-2.5 w-full cursor-pointer rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            title="অগ্রগতি পরিবর্তন করতে ক্লিক করুন"
          >
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-200 group-hover:opacity-90"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
            <span>{formatDigitalTimeBengali(currentElapsedSeconds)}</span>
            <span className="text-[10px]">
              বাক্য {toBengaliDigits(currentSentenceIndex + 1)} / {toBengaliDigits(sentences.length)}
            </span>
            <span>{formatDigitalTimeBengali(totalSeconds)}</span>
          </div>
        </div>

        {/* Main Controls Bar */}
        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Left: Rewind & Play/Pause */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRewind}
              disabled={currentSentenceIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
              title="১০ সেকেন্ড পেছনে যান"
            >
              <RotateCcw size={14} />
            </button>

            {isPlaying ? (
              <button
                type="button"
                onClick={handlePause}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-transform active:scale-95"
                title="পজ করুন"
              >
                <Pause size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-transform active:scale-95"
                title={isPaused ? "চালু রাখুন" : "শুরু থেকে শুনুন"}
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleForward}
              disabled={currentSentenceIndex >= sentences.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
              title="১০ সেকেন্ড সামনে যান"
            >
              <RotateCw size={14} />
            </button>

            {(isPlaying || isPaused) && (
              <button
                type="button"
                onClick={handleStop}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
                title="বন্ধ করুন"
              >
                <Square size={13} fill="currentColor" />
              </button>
            )}
          </div>

          {/* Subtitle / Current Sentence snippet */}
          <div className="hidden md:block flex-1 mx-4 text-center">
            {isPlaying || isPaused ? (
              <p className="text-xs font-semibold text-[var(--color-text)] truncate max-w-md mx-auto bg-[var(--color-bg)] py-1 px-3 rounded-lg border border-[var(--color-border)] italic">
                "{sentences[currentSentenceIndex]}"
              </p>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                ক্লিক করে পুরো সংবাদের অডিও শুনুন
              </p>
            )}
          </div>

          {/* Right: Mute & Volume toggle */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:text-[var(--color-text)] transition-colors"
              title={isMuted ? "শব্দ চালু করুন" : "নিঃশব্দ করুন"}
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
              className="w-16 sm:w-20 accent-[var(--color-primary)] cursor-pointer"
              title={`ভলিউম: ${toBengaliDigits(Math.round((isMuted ? 0 : volume) * 100))}%`}
            />
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Mini-Player (Appears on scroll when playing) */}
      {(isPlaying || isPaused) && showFloatingDock && !isDockDismissed && (
        <aside
          role="complementary"
          aria-label="অডিও নিউজ ফ্লোটিং ডক প্লেয়ার"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Play/Pause Mini */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPlaying ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition-colors"
                  title="পজ করুন"
                >
                  <Pause size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow hover:opacity-90 transition-colors"
                  title="চালু করুন"
                >
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleStop}
                className="p-1 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                title="বন্ধ করুন"
              >
                <Square size={12} fill="currentColor" />
              </button>
            </div>

            {/* Title & Progress info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[var(--color-text)] truncate leading-snug">
                {title}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium flex-shrink-0">
                  {formatDigitalTimeBengali(currentElapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Speed toggle & Scroll to top */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (PLAYBACK_SPEEDS.indexOf(speed) + 1) % PLAYBACK_SPEEDS.length;
                  handleSpeedChange(PLAYBACK_SPEEDS[nextIdx] ?? 1.0);
                }}
                className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[10px] font-bold text-[var(--color-text)] hover:border-[var(--color-primary)]"
                title="গতি পরিবর্তন করুন"
              >
                {toBengaliDigits(speed)}x
              </button>

              <button
                type="button"
                onClick={scrollToPlayer}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                title="মূল প্লেয়ারে যান"
              >
                <ArrowUpCircle size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsDockDismissed(true)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                title="ডক বন্ধ করুন"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
