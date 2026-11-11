"use client";

import { useState, useEffect, useRef } from "react";

interface AbHeadlineDisplayProps {
  articleId: string;
  titleA: string;
  headlineB?: string | null;
  abTestStatus?: string | null;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
}

export function AbHeadlineDisplay({
  articleId,
  titleA,
  headlineB,
  abTestStatus,
  className = "",
  as: Component = "span",
}: AbHeadlineDisplayProps) {
  const isAbActive = abTestStatus === "active" && !!headlineB?.trim();
  const [selectedVariant, setSelectedVariant] = useState<"a" | "b">("a");
  const impressionRecorded = useRef(false);

  useEffect(() => {
    if (!isAbActive || !articleId) {
      setSelectedVariant("a");
      return;
    }

    // Determine variant deterministically per user device
    let variant: "a" | "b" = "a";
    try {
      const storageKey = `barta_ab_${articleId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved === "a" || saved === "b") {
        variant = saved;
      } else {
        variant = Math.random() < 0.5 ? "a" : "b";
        localStorage.setItem(storageKey, variant);
      }
    } catch {
      variant = Math.random() < 0.5 ? "a" : "b";
    }

    setSelectedVariant(variant);

    // Record impression once
    if (!impressionRecorded.current) {
      impressionRecorded.current = true;
      try {
        fetch("/api/articles/ab-test/impression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId, variant }),
        }).catch(() => {});
      } catch {}
    }
  }, [isAbActive, articleId]);

  const handleClick = () => {
    if (!isAbActive || !articleId) return;
    try {
      fetch("/api/articles/ab-test/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, variant: selectedVariant }),
      }).catch(() => {});
    } catch {}
  };

  const displayText = isAbActive && selectedVariant === "b" && headlineB ? headlineB : titleA;

  return (
    <Component className={className} onClick={handleClick}>
      {displayText}
    </Component>
  );
}
