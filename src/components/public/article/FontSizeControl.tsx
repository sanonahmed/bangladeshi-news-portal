"use client";

import { useEffect, useState } from "react";
import { Type } from "lucide-react";

const SIZES = [
  { label: "ছোট", className: "text-base" },
  { label: "মাঝারি", className: "text-lg" },
  { label: "বড়", className: "text-xl" },
];

export function FontSizeControl() {
  const [currentIndex, setCurrentIndex] = useState(1); // default to medium (text-lg)

  useEffect(() => {
    const saved = localStorage.getItem("news-font-size-index");
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx >= 0 && idx < SIZES.length) {
        setCurrentIndex(idx);
      }
    }
  }, []);

  const changeSize = (idx: number) => {
    setCurrentIndex(idx);
    localStorage.setItem("news-font-size-index", idx.toString());
    const bodyElem = document.getElementById("article-content-body");
    if (bodyElem) {
      SIZES.forEach((s) => bodyElem.classList.remove(s.className));
      const chosen = SIZES[idx];
      if (chosen) {
        bodyElem.classList.add(chosen.className);
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 border border-[var(--color-border)] px-2 py-1 rounded bg-[var(--color-bg)]">
      <Type size={13} className="text-[var(--color-text-muted)]" />
      <span className="text-[11px] text-[var(--color-text-muted)] mr-1">অক্ষর:</span>
      {SIZES.map((size, idx) => (
        <button
          key={size.label}
          onClick={() => changeSize(idx)}
          className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${
            currentIndex === idx
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
          aria-label={`হরফের আকার ${size.label}`}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
