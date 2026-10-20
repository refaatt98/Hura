import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import type { Workshop } from "../types";
import { createWorkshopRegistration } from "../lib/api";
import { money } from "../lib/format";
import { Field, TextArea } from "./Field";

export default function RegistrationForm({ workshop: w, onRegistered }: { workshop: Workshop; onRegistered: (seats: number) => void }) {
  const left = w.seats - w.seatsTaken;
  const [seats, setSeats] = useState(1);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      await createWorkshopRegistration({
        workshopId: w.id,
        workshopTitle: w.title,
        name: String(f.get("name")).trim(),
        phone: String(f.get("phone")).trim(),
        email: String(f.get("email") ?? "").trim() || undefined,
        notes: String(f.get("notes") ?? "").trim() || undefined,
        seats,
      });
      setState("sent");
      onRegistered(seats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "صار خطأ، جرّب مرة ثانية.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h3 className="mt-4 text-2xl font-black">تم حجز مقعدك!</h3>
        <p className="mt-2 text-sm text-ink-soft">رح نبعتلك تفاصيل الدفع والتأكيد على رقمك قبل الورشة.</p>
      </div>
    );
  }

  if (left <= 0) {
    return (
      <div className="py-6 text-center">
        <p className="font-display text-xl font-bold">الورشة مكتملة</p>
        <p className="mt-2 text-sm text-ink-soft">تواصل معنا لنضيفك على قائمة الانتظار.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="الاسم" name="name" required minLength={2} autoComplete="name" />
      <Field label="رقم الهاتف / واتساب" name="phone" type="tel" required dir="ltr" className="[&_input]:text-right" pattern="[0-9+\s\-]{7,}" title="رقم هاتف صحيح" autoComplete="tel" />
      <Field label="الإيميل" name="email" type="email" dir="ltr" className="[&_input]:text-right" autoComplete="email" hint="اختياري" />

      <div className="flex items-center justify-between rounded-2xl bg-paper p-3">
        <span className="text-sm font-medium">عدد المقاعد</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSeats((s) => Math.max(1, s - 1))} className="grid size-8 place-items-center rounded-full ring-1 ring-ink/20 hover:ring-ink" aria-label="أقل">
            <Minus className="size-4" />
          </button>
          <span className="w-5 text-center font-mono font-semibold">{seats}</span>
          <button type="button" onClick={() => setSeats((s) => Math.min(left, 5, s + 1))} className="grid size-8 place-items-center rounded-full ring-1 ring-ink/20 hover:ring-ink" aria-label="أكثر">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <TextArea label="ملاحظات" name="notes" placeholder="أي إشي بتحب نعرفه قبل الورشة" className="[&_textarea]:min-h-20" />

      {error && <p className="text-sm text-accent-deep">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 font-display font-bold text-paper transition-colors hover:bg-accent-deep disabled:opacity-70"
      >
        {state === "sending" && <Loader2 className="size-4 animate-spin" />}
        احجز مقعدك · {money(w.price * seats)}
      </button>
      <p className="text-center text-xs text-muted">ما في دفع هلأ — منتواصل معك لنأكد الحجز.</p>
    </form>
  );
}
