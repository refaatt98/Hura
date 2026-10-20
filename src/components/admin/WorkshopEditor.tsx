import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { Workshop, WorkshopMode } from "../../types";
import { saveWorkshop } from "../../lib/api";
import { Field, TextArea } from "../Field";

const blank: Workshop = {
  id: "",
  title: "",
  summary: "",
  description: "",
  date: "",
  durationHours: 2,
  mode: "أونلاين",
  location: "Zoom",
  price: 50,
  seats: 30,
  seatsTaken: 0,
  trainer: "فريق Hura",
  agenda: [],
};

/** "2026-11-14T10:00:00" → value for <input type="datetime-local"> */
const toLocal = (iso: string) => (iso ? iso.slice(0, 16) : "");

export default function WorkshopEditor({ workshop, onSaved }: { workshop?: Workshop; onSaved: (w: Workshop) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const base = workshop ?? blank;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const n = (k: string) => Number(f.get(k) ?? 0);
    const saved: Workshop = {
      ...base,
      id: base.id || `ws-${Date.now().toString(36)}`,
      title: s("title"),
      summary: s("summary"),
      description: s("description"),
      date: `${s("date")}:00`,
      durationHours: n("durationHours"),
      mode: s("mode") as WorkshopMode,
      location: s("location"),
      price: n("price"),
      seats: n("seats"),
      seatsTaken: Math.min(n("seatsTaken"), n("seats")),
      trainer: s("trainer"),
      agenda: s("agenda").split("\n").map((x) => x.trim()).filter(Boolean),
    };
    setBusy(true);
    setError("");
    try {
      await saveWorkshop(saved);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ما انحفظ، جرّب مرة ثانية.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="اسم الورشة" name="title" required defaultValue={base.title} className="sm:col-span-2" />
      <TextArea label="وصف قصير" name="summary" required defaultValue={base.summary} className="sm:col-span-2 [&_textarea]:min-h-16" />
      <TextArea label="الوصف الكامل" name="description" required defaultValue={base.description} className="sm:col-span-2" />
      <Field label="التاريخ والوقت" name="date" type="datetime-local" required defaultValue={toLocal(base.date)} />
      <Field label="المدة (ساعات)" name="durationHours" type="number" min={1} required defaultValue={base.durationHours} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">النوع</span>
        <select name="mode" defaultValue={base.mode} className="w-full rounded-lg border-2 border-line bg-paper px-3.5 py-2.5 focus:border-ink focus:outline-none">
          <option>حضوري</option>
          <option>أونلاين</option>
        </select>
      </label>
      <Field label="المكان / الرابط" name="location" required defaultValue={base.location} />
      <Field label="السعر (₪)" name="price" type="number" min={0} required defaultValue={base.price} />
      <Field label="المدرّب" name="trainer" required defaultValue={base.trainer} />
      <Field label="عدد المقاعد" name="seats" type="number" min={1} required defaultValue={base.seats} />
      <Field label="المقاعد المحجوزة" name="seatsTaken" type="number" min={0} required defaultValue={base.seatsTaken} />
      <TextArea label="البرنامج (كل بند بسطر)" name="agenda" defaultValue={base.agenda.join("\n")} className="sm:col-span-2" />
      {error && <p className="text-sm text-accent-deep sm:col-span-2">{error}</p>}
      <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-display font-bold text-paper hover:bg-accent-deep disabled:opacity-70 sm:col-span-2">
        {busy && <Loader2 className="size-4 animate-spin" />} حفظ
      </button>
    </form>
  );
}
