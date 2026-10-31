"use client";

import { useEffect } from "react";

interface ArticleReadingTrackerProps {
  articleId: string;
}

export function ArticleReadingTracker({ articleId }: ArticleReadingTrackerProps) {
  useEffect(() => {
    // Send buffered view count to API after 2 seconds of actual presence
    const timer = setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      }).catch(() => {
        // Silent catch for background metric
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [articleId]);

  return null;
}
