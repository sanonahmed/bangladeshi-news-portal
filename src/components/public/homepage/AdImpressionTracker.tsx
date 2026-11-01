"use client";

import { useEffect } from "react";

export function AdImpressionTracker({ adId }: { adId: string }) {
  useEffect(() => {
    if (adId && typeof window !== "undefined") {
      fetch(`/api/ads/impression?id=${adId}`, {
        method: "GET",
        keepalive: true,
      }).catch(() => {});
    }
  }, [adId]);

  return null;
}
