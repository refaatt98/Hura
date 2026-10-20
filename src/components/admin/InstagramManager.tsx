import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { InstagramPost } from "../../types";
import { deleteInstagramPost, getInstagramPosts, saveInstagramPost } from "../../lib/api";
import { useSite } from "../SiteProvider";
import Modal from "../Modal";
import Skeleton from "../Skeleton";
import { Field, TextArea } from "../Field";
import ImageInput from "./ImageInput";

type Draft = Omit<InstagramPost, "id"> & { id?: string };

export default function InstagramManager() {
  const { site } = useSite();
  const [posts, setPosts] = useState<InstagramPost[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => getInstagramPosts().then(setPosts);
  useEffect(() => {
    load();
  }, []);

  const startNew = () =>
    setDraft({ image: "", title: "", caption: "", url: site.instagramUrl, sort: (posts?.length ?? 0) + 1 });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.image) {
      setError("ارفع صورة أو حط رابطها.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveInstagramPost(draft);
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "صار خطأ");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: InstagramPost) {
    if (!confirm(`حذف «${p.title}»؟`)) return;
    setPosts((xs) => xs?.filter((x) => x.id !== p.id) ?? null);
    await deleteInstagramPost(p.id);
  }

  /** Swap order with the neighbour above/below. */
  async function move(i: number, dir: -1 | 1) {
    if (!posts) return;
    const j = i + dir;
    if (j < 0 || j >= posts.length) return;
    const next = [...posts];
    [next[i], next[j]] = [next[j], next[i]];
    const renumbered = next.map((p, k) => ({ ...p, sort: k + 1 }));
    setPosts(renumbered);
    await Promise.all(renumbered.map((p) => saveInstagramPost(p)));
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">أول 3 منشورات بالترتيب بيظهروا بالرئيسية.</p>
        <button type="button" onClick={startNew} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-paper hover:bg-accent-deep">
          <Plus className="size-4" /> منشور جديد
        </button>
      </div>

      {!posts ? (
        <Skeleton className="h-64" />
      ) : posts.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-line py-14 text-center text-muted">ما في منشورات — ضيف أول واحد.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((p, i) => (
            <li key={p.id} className={`overflow-hidden rounded-2xl bg-card ring-1 ${i < 3 ? "ring-accent" : "ring-ink/10"}`}>
              <div className="relative aspect-[4/3] bg-paper-deep">
                <img src={p.image} alt="" className="size-full object-cover" />
                <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${i < 3 ? "bg-accent text-paper" : "bg-paper text-muted"}`}>
                  {i < 3 ? `بالرئيسية #${i + 1}` : "مخفي"}
                </span>
              </div>
              <div className="flex items-center gap-1 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold">{p.title}</p>
                  <p className="truncate text-xs text-muted">{p.caption}</p>
                </div>
                <IconBtn label="لفوق" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-4" /></IconBtn>
                <IconBtn label="لتحت" onClick={() => move(i, 1)} disabled={i === posts.length - 1}><ArrowDown className="size-4" /></IconBtn>
                <IconBtn label="تعديل" onClick={() => setDraft(p)}><Pencil className="size-4" /></IconBtn>
                <IconBtn label="حذف" onClick={() => remove(p)} danger><Trash2 className="size-4" /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "تعديل المنشور" : "منشور جديد"}>
        {draft && (
          <form onSubmit={save} className="space-y-4">
            <ImageInput value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
            <Field label="العنوان" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <TextArea label="وصف قصير" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className="[&_textarea]:min-h-16" />
            <Field
              label="رابط المنشور على إنستغرام"
              required
              type="url"
              dir="ltr"
              className="[&_input]:text-right"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              hint="افتح المنشور على إنستغرام ← مشاركة ← نسخ الرابط"
            />
            {error && <p className="text-sm text-accent-deep">{error}</p>}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-display font-bold text-paper hover:bg-accent-deep disabled:opacity-70">
              {busy && <Loader2 className="size-4 animate-spin" />} حفظ
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}

function IconBtn({ label, onClick, children, danger, disabled }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-25 ${danger ? "text-accent-deep hover:bg-accent-soft" : "text-ink-soft hover:bg-paper-deep"}`}
    >
      {children}
    </button>
  );
}
