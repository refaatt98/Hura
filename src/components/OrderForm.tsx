import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Idea } from "../types";
import { createIdeaOrder } from "../lib/api";
import { money } from "../lib/format";
import { Field, TextArea } from "./Field";

export default function OrderForm({ idea, onDone }: { idea: Idea; onDone: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      await createIdeaOrder({
        ideaId: idea.id,
        ideaTitle: idea.title,
        name: String(f.get("name")).trim(),
        phone: String(f.get("phone")).trim(),
        email: String(f.get("email") ?? "").trim() || undefined,
        notes: String(f.get("notes") ?? "").trim() || undefined,
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h3 className="mt-4 text-2xl font-bold">وصل طلبك!</h3>
        <p className="mt-2 text-ink-soft">رح نتواصل معك خلال 24 ساعة لنأكد الطلب ونرسلك ملف «{idea.title}».</p>
        <button type="button" onClick={onDone} className="mt-6 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper">
          تمام
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-paper p-4">
        <div>
          <span className="file-label">{idea.code}</span>
          <p className="font-display font-bold">{idea.title}</p>
        </div>
        <span className="font-display text-xl font-bold text-accent">{money(idea.price)}</span>
      </div>
      <Field label="الاسم" name="name" required autoComplete="name" minLength={2} />
      <Field label="رقم الهاتف / واتساب" name="phone" type="tel" required dir="ltr" className="text-right" autoComplete="tel" pattern="[0-9+\s\-]{7,}" title="رقم هاتف صحيح" />
      <Field label="الإيميل" name="email" type="email" dir="ltr" autoComplete="email" hint="اختياري — لنرسلك الملف عليه" />
      <TextArea label="ملاحظات" name="notes" placeholder="مثلاً: المدينة اللي ناوي تفتح فيها" />
      {state === "error" && <p className="text-sm text-accent-deep">صار خطأ، جرّب مرة ثانية.</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 font-display font-semibold text-paper transition-colors hover:bg-accent-deep disabled:opacity-70"
      >
        {state === "sending" && <Loader2 className="size-4 animate-spin" />}
        {state === "sending" ? "عم نرسل…" : "أكّد الطلب"}
      </button>
      <p className="text-center text-xs text-muted">ما في دفع هلأ — منتواصل معك لنكمّل الطلب.</p>
    </form>
  );
}
