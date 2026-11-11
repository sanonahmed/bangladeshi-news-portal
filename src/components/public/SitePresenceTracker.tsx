"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SitePresenceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or retrieve persistent session ID for active reader presence
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

    const sendHeartbeat = () => {
      // Only track if document is visible
      if (typeof document !== "undefined" && document.hidden) return;

      fetch("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pathname,
        }),
      }).catch(() => {
        // Silently catch background network hiccups
      });
    };

    // Send immediate heartbeat on route change
    sendHeartbeat();

    // Heartbeat every 25 seconds while user is actively browsing
    const interval = setInterval(sendHeartbeat, 25000);

    const handleVisibility = () => {
      if (!document.hidden) {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);

  return null;
}
