import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { Difficulty, Idea } from "../../types";
import { saveIdea } from "../../lib/api";
import { Field, TextArea } from "../Field";

const blank: Idea = {
  id: "",
  code: "",
  title: "",
  category: "",
  summary: "",
  description: "",
  price: 149,
  capitalMin: 10000,
  capitalMax: 20000,
  paybackMonths: 8,
  marginPercent: 40,
  difficulty: "سهل",
  includes: [],
  featured: false,
};

export default function IdeaEditor({ idea, onSaved }: { idea?: Idea; onSaved: (i: Idea) => void }) {
  const [busy, setBusy] = useState(false);
  const base = idea ?? blank;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const n = (k: string) => Number(f.get(k) ?? 0);
    const saved: Idea = {
      ...base,
      id: base.id || `idea-${Date.now().toString(36)}`,
      code: s("code") || `F-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: s("title"),
      category: s("category"),
      summary: s("summary"),
      description: s("description"),
      price: n("price"),
      capitalMin: n("capitalMin"),
      capitalMax: Math.max(n("capitalMax"), n("capitalMin")),
      paybackMonths: n("paybackMonths"),
      marginPercent: n("marginPercent"),
      difficulty: s("difficulty") as Difficulty,
      includes: s("includes").split("\n").map((x) => x.trim()).filter(Boolean),
      featured: f.get("featured") === "on",
    };
    setBusy(true);
    await saveIdea(saved);
    setBusy(false);
    onSaved(saved);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="اسم الفكرة" name="title" required defaultValue={base.title} className="sm:col-span-2" />
      <Field label="الرمز" name="code" defaultValue={base.code} placeholder="F-070" dir="ltr" className="[&_input]:text-right" hint="بيتولّد لحاله إذا تركته فاضي" />
      <Field label="المجال" name="category" required defaultValue={base.category} list="idea-categories" />
      <datalist id="idea-categories">
        {["أغذية ومشروبات", "تجارة إلكترونية", "خدمات", "تعليم وخدمات"].map((c) => <option key={c} value={c} />)}
      </datalist>
      <TextArea label="وصف قصير (للكرت)" name="summary" required defaultValue={base.summary} className="sm:col-span-2 [&_textarea]:min-h-16" />
      <TextArea label="الوصف الكامل" name="description" required defaultValue={base.description} className="sm:col-span-2" />
      <Field label="سعر الملف (₪)" name="price" type="number" min={0} required defaultValue={base.price} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">الصعوبة</span>
        <select name="difficulty" defaultValue={base.difficulty} className="w-full rounded-lg border-2 border-line bg-paper px-3.5 py-2.5 focus:border-ink focus:outline-none">
          {["سهل", "متوسط", "متقدم"].map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <Field label="رأس المال من (₪)" name="capitalMin" type="number" min={0} required defaultValue={base.capitalMin} />
      <Field label="رأس المال إلى (₪)" name="capitalMax" type="number" min={0} required defaultValue={base.capitalMax} />
      <Field label="الاسترداد (أشهر)" name="paybackMonths" type="number" min={1} required defaultValue={base.paybackMonths} />
      <Field label="هامش الربح (%)" name="marginPercent" type="number" min={1} max={100} required defaultValue={base.marginPercent} />
      <TextArea label="شو بيشمل الملف (كل بند بسطر)" name="includes" defaultValue={base.includes.join("\n")} className="sm:col-span-2" />
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="featured" defaultChecked={base.featured} className="size-4 accent-[var(--color-accent)]" />
        فكرة مميزة (بتظهر بالرئيسية)
      </label>
      <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-display font-bold text-paper hover:bg-accent-deep disabled:opacity-70 sm:col-span-2">
        {busy && <Loader2 className="size-4 animate-spin" />} حفظ
      </button>
    </form>
  );
}
