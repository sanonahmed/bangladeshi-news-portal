/**
 * YouTube Utility functions for parsing IDs, embed URLs, and HQ thumbnails
 * (Re-exported from unified video-embed utility for backward compatibility)
 */

export {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getVideoThumbnail,
  detectVideoPlatform,
  extractFacebookVideoId,
  getFacebookEmbedUrl,
  getVideoEmbedUrl,
  generateVideoIframeHtml,
  type VideoPlatform,
} from "./video-embed";

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
