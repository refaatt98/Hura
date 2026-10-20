import { isVideoUrl } from "../lib/media";

/** Shows an image, or a muted looping video when the URL is a video file. */
export default function Media({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  if (isVideoUrl(src)) {
    return <video src={src} className={className} autoPlay muted loop playsInline preload="metadata" aria-label={alt} />;
  }
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}
