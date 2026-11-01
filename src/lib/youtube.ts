/**
 * YouTube Utility functions for parsing IDs, embed URLs, and HQ thumbnails
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Match standard, short, embed, shorts, and live URLs
  const regExp =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  const id = match ? match[1] : undefined;
  return id && id.length === 11 ? id : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
}
