"use client";

import { useEffect } from "react";

interface ArticleReadingTrackerProps {
  articleId: string;
}

export function ArticleReadingTracker({ articleId }: ArticleReadingTrackerProps) {
  useEffect(() => {
    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem("portal_session_id") || "";
      if (!sessionId) {
        sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        sessionStorage.setItem("portal_session_id", sessionId);
      }
    } catch {
      sessionId = `sess_${Math.random().toString(36).slice(2)}`;
    }

    // 1. Record authentic view count after 2 seconds of confirmed presence
    const viewTimer = setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, sessionId }),
      }).catch(() => {
        // Silent catch for background metric
      });
    }, 2000);

    // 2. Keep registering this visitor as an active reader on this specific article
    const sendArticleHeartbeat = () => {
      if (typeof document !== "undefined" && document.hidden) return;

      fetch("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          articleId,
          pathname: `/news/${articleId}`,
        }),
      }).catch(() => {});
    };

    const heartbeatInterval = setInterval(sendArticleHeartbeat, 25000);

    return () => {
      clearTimeout(viewTimer);
      clearInterval(heartbeatInterval);
    };
  }, [articleId]);

  return null;
}
