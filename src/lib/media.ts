/** True when a URL points to a video file (by extension). */
export const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/i.test(url);
