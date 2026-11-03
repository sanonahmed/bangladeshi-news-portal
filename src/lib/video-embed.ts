/**
 * Video Utility for YouTube and Facebook Video Embeds
 * Supports extracting IDs, constructing responsive iframe embed URLs, and generating thumbnails.
 */

export type VideoPlatform = "youtube" | "facebook" | "unknown";

/**
 * Detect whether a URL is from YouTube or Facebook
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  if (!url) return "unknown";
  const trimmed = url.trim();
  if (/^(https?:\/\/)?((www|m)\.)?(youtube\.com|youtu\.be)\/.+/i.test(trimmed)) {
    return "youtube";
  }
  if (/^(https?:\/\/)?((www|web|m)\.)?(facebook\.com|fb\.watch)\/.+/i.test(trimmed)) {
    return "facebook";
  }
  return "unknown";
}

/**
 * Extract YouTube 11-character video ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  const id = match ? match[1] : undefined;
  return id && id.length === 11 ? id : null;
}

/**
 * Extract Facebook Video ID or handle from common Facebook video URL formats
 */
export function extractFacebookVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: /videos/123456789/
  // Pattern 2: ?v=123456789
  // Pattern 3: /reel/123456789
  // Pattern 4: fb.watch/abcdef/
  // Pattern 5: /posts/123456789
  const match = trimmed.match(
    /(?:videos\/|v=|reel\/|fb\.watch\/|posts\/)([0-9a-zA-Z_-]+)/i
  );
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: use clean alphanumeric hash of the URL if no specific ID matched
  return `fb-${Math.abs(
    trimmed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(36)}`;
}

/**
 * Generate official Facebook Video plugin embed URL
 */
export function getFacebookEmbedUrl(videoUrl: string, autoplay = false): string {
  const cleanUrl = videoUrl.trim();
  const encoded = encodeURIComponent(cleanUrl);
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=${autoplay ? "true" : "false"}&width=1280`;
}

/**
 * Generate official YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string, autoplay = false): string {
  const id = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl;
  return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
}

/**
 * Get unified embed URL for any supported platform
 */
export function getVideoEmbedUrl(urlOrId: string, autoplay = false): string {
  const platform = detectVideoPlatform(urlOrId);
  if (platform === "facebook") {
    return getFacebookEmbedUrl(urlOrId, autoplay);
  }
  if (platform === "youtube") {
    return getYouTubeEmbedUrl(urlOrId, autoplay);
  }
  // If it's already an 11-char YouTube ID
  if (urlOrId.length === 11 && !urlOrId.includes("/")) {
    return getYouTubeEmbedUrl(urlOrId, autoplay);
  }
  return urlOrId;
}

/**
 * Default stylized Facebook video poster image (SVG Data URI)
 */
export const DEFAULT_FB_THUMBNAIL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
      <rect width="640" height="360" fill="#0f172a"/>
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1877F2" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
      </radialGradient>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="320" cy="180" r="48" fill="#1877F2"/>
      <polygon points="312,162 338,180 312,198" fill="#ffffff"/>
      <path d="M40 320 H600" stroke="#334155" stroke-width="2"/>
      <text x="40" y="300" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">FACEBOOK VIDEO REPORT</text>
      <rect x="520" y="280" width="80" height="24" rx="4" fill="#1877F2"/>
      <text x="560" y="296" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">WATCH</text>
    </svg>
  `);

/**
 * Get video thumbnail (YouTube HQ thumbnail or Facebook styled poster)
 */
export function getVideoThumbnail(
  urlOrId: string,
  customThumbnail?: string | null
): string {
  if (customThumbnail && customThumbnail.trim()) {
    return customThumbnail.trim();
  }

  const platform = detectVideoPlatform(urlOrId);
  if (platform === "youtube") {
    const ytId = extractYouTubeId(urlOrId) || urlOrId;
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  if (platform === "facebook") {
    return DEFAULT_FB_THUMBNAIL;
  }

  if (urlOrId.length === 11 && !urlOrId.includes("/")) {
    return `https://img.youtube.com/vi/${urlOrId}/hqdefault.jpg`;
  }

  return DEFAULT_FB_THUMBNAIL;
}

/**
 * Generate standard HTML iframe for Tiptap rich text editor insertion
 */
export function generateVideoIframeHtml(url: string): string | null {
  const platform = detectVideoPlatform(url);

  if (platform === "youtube") {
    const ytId = extractYouTubeId(url);
    if (!ytId) return null;
    return `<iframe src="https://www.youtube.com/embed/${ytId}?rel=0" class="w-full aspect-video rounded my-4 border-0" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`;
  }

  if (platform === "facebook") {
    const embedSrc = getFacebookEmbedUrl(url, false);
    return `<iframe src="${embedSrc}" class="w-full aspect-video rounded my-4 border-0" frameborder="0" allowfullscreen="true" scrolling="no" style="border:none;overflow:hidden" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
  }

  return null;
}
