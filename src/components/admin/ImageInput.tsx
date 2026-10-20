import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "../../lib/api";

/** Pick an image file (uploaded to Supabase Storage) or paste an image URL. */
export default function ImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "صار خطأ");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">الصورة <span className="text-accent">*</span></span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative grid aspect-[4/5] w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper-deep ring-1 ring-ink/10 hover:ring-ink"
          aria-label="اختر صورة"
        >
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6 text-muted" />}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-ink/50 text-paper">
              <Loader2 className="size-6 animate-spin" />
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
            {busy ? "عم نرفع…" : value ? "غيّر الصورة" : "ارفع صورة"}
          </button>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="أو الصق رابط صورة"
            dir="ltr"
            className="w-full rounded-lg border-2 border-line bg-paper px-3 py-2 text-xs focus:border-ink focus:outline-none"
          />
          <p className="text-xs text-muted">JPG / PNG / WEBP — حتى 5MB. الأفضل مقاس طولي 4:5.</p>
          {error && <p className="text-xs text-accent-deep">{error}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
