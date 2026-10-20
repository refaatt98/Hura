import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadMedia } from "../../lib/api";
import Media from "../Media";

/** Pick an image or video (uploaded to Cloudflare R2) or paste a URL. */
export default function MediaInput({ value, onChange, label = "الصورة أو الفيديو" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const busy = progress !== null;

  async function pick(file?: File) {
    if (!file) return;
    setProgress(0);
    setError("");
    try {
      onChange(await uploadMedia(file, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "صار خطأ");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label} <span className="text-accent">*</span></span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => !busy && fileRef.current?.click()}
          className="relative grid aspect-[4/5] w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper-deep ring-1 ring-ink/10 hover:ring-ink"
          aria-label="اختر ملف"
        >
          {value ? <Media src={value} className="size-full object-cover" /> : <ImagePlus className="size-6 text-muted" />}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-ink/60 text-paper">
              <span className="text-center">
                <Loader2 className="mx-auto size-6 animate-spin" />
                <span className="mt-1 block font-mono text-xs">{progress}%</span>
              </span>
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-2 disabled:opacity-60"
          >
            {busy ? `عم نرفع… ${progress}%` : value ? "غيّر الملف" : "ارفع صورة أو فيديو"}
          </button>
          {busy && (
            <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
              <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="أو الصق رابط"
            dir="ltr"
            className="w-full rounded-lg border-2 border-line bg-paper px-3 py-2 text-xs focus:border-ink focus:outline-none"
          />
          <p className="text-xs text-muted">صور (JPG/PNG/WEBP) أو فيديو (MP4/WEBM/MOV) — حتى 500MB. بينرفع على Cloudflare R2.</p>
          {error && <p className="text-xs text-accent-deep">{error}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
