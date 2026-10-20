import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Inbox, MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import type { RequestStatus, SubmissionKind } from "../../types";
import { deleteSubmission, getSubmissions, updateSubmissionStatus, type SubmissionMap } from "../../lib/api";
import { formatDate, formatTime, money } from "../../lib/format";
import StatusBadge, { statuses } from "./StatusBadge";
import Skeleton from "../Skeleton";

type Row = { label: string; value: string | number | undefined };

interface Config<K extends SubmissionKind> {
  title: (x: SubmissionMap[K]) => string;
  subtitle: (x: SubmissionMap[K]) => string;
  rows: (x: SubmissionMap[K]) => Row[];
  phone: (x: SubmissionMap[K]) => string | undefined;
}

const configs: { [K in SubmissionKind]: Config<K> } = {
  orders: {
    title: (x) => x.name,
    subtitle: (x) => `${x.code ? x.code + " · " : ""}${x.items.length} ملف · ${money(x.total)} · ${x.items.map((i) => i.title).join("، ")}`,
    rows: (x) => [
      { label: "رقم الطلب", value: x.code },
      { label: "المجموع", value: money(x.total) },
      { label: "الملفات", value: x.items.map((i, n) => `${n + 1}. ${i.title}${i.code ? ` (${i.code})` : ""}${i.price ? ` — ${money(i.price)}` : ""}`).join("\n") },
      { label: "الهاتف", value: x.phone },
      { label: "العنوان", value: x.address },
      { label: "ملاحظات", value: x.notes },
    ],
    phone: (x) => x.phone,
  },
  custom: {
    title: (x) => x.name,
    subtitle: (x) => `${x.field} · ${x.budget} · ${x.city}`,
    rows: (x) => [
      { label: "المجال", value: x.field },
      { label: "الفكرة", value: x.idea },
      { label: "الميزانية", value: x.budget },
      { label: "البداية", value: x.timeline },
      { label: "المدينة", value: x.city },
      { label: "الهاتف", value: x.phone },
      { label: "الإيميل", value: x.email },
      { label: "التواصل عبر", value: x.contactVia },
    ],
    phone: (x) => x.phone,
  },
  registrations: {
    title: (x) => x.name,
    subtitle: (x) => `${x.workshopTitle} · ${x.seats} مقعد`,
    rows: (x) => [
      { label: "الورشة", value: x.workshopTitle },
      { label: "المقاعد", value: x.seats },
      { label: "الهاتف", value: x.phone },
      { label: "الإيميل", value: x.email },
      { label: "ملاحظات", value: x.notes },
    ],
    phone: (x) => x.phone,
  },
  messages: {
    title: (x) => x.name,
    subtitle: (x) => `${x.subject} · ${x.message.slice(0, 60)}`,
    rows: (x) => [
      { label: "الموضوع", value: x.subject },
      { label: "التواصل", value: x.contact },
      { label: "الرسالة", value: x.message },
    ],
    phone: (x) => (/^[0-9+\s-]{7,}$/.test(x.contact) ? x.contact : undefined),
  },
};

export default function SubmissionsPanel<K extends SubmissionKind>({ kind, onChange }: { kind: K; onChange?: () => void }) {
  const [items, setItems] = useState<SubmissionMap[K][] | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "الكل">("الكل");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const cfg = configs[kind] as Config<K>;

  useEffect(() => {
    setItems(null);
    getSubmissions(kind).then(setItems);
  }, [kind]);

  const list = useMemo(
    () =>
      (items ?? [])
        .filter((x) => filter === "الكل" || x.status === filter)
        .filter((x) => !q.trim() || JSON.stringify(x).includes(q.trim())),
    [items, filter, q],
  );

  async function setStatus(id: string, status: RequestStatus) {
    setItems((xs) => xs?.map((x) => (x.id === id ? { ...x, status } : x)) ?? null);
    await updateSubmissionStatus(kind, id, status);
    onChange?.();
  }

  async function remove(id: string) {
    if (!confirm("متأكد بدك تحذف هاد الطلب؟")) return;
    setItems((xs) => xs?.filter((x) => x.id !== id) ?? null);
    await deleteSubmission(kind, id);
    onChange?.();
  }

  const count = (s: RequestStatus) => (items ?? []).filter((x) => x.status === s).length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(["الكل", ...statuses] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ${filter === s ? "bg-ink text-paper ring-ink" : "bg-card ring-ink/10 hover:ring-ink"}`}
            >
              {s} {s !== "الكل" && <span className="font-mono text-xs opacity-60">{count(s)}</span>}
            </button>
          ))}
        </div>
        <label className="relative sm:w-64">
          <span className="sr-only">بحث</span>
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث…" className="w-full rounded-full bg-card py-2 pr-9 pl-3 text-sm ring-1 ring-ink/10 focus:ring-ink focus:outline-none" />
        </label>
      </div>

      {items === null ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-line py-16 text-center text-muted">
          <Inbox className="mx-auto size-10" />
          <p className="mt-3">ما في شي هون لسا.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((x) => {
            const isOpen = open === x.id;
            const phone = cfg.phone(x);
            return (
              <li key={x.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-ink/10">
                <button type="button" onClick={() => setOpen(isOpen ? null : x.id)} className="flex w-full items-center gap-3 p-4 text-right" aria-expanded={isOpen}>
                  <span className={`size-2 shrink-0 rounded-full ${x.status === "جديد" ? "bg-accent" : "bg-transparent"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold">{cfg.title(x)}</span>
                      <StatusBadge status={x.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-soft">{cfg.subtitle(x)}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">{formatDate(x.createdAt)}</span>
                  <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-dashed border-line p-4">
                        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          {cfg.rows(x).filter((r) => r.value !== undefined && r.value !== "").map((r) => (
                            <div key={r.label} className="min-w-0">
                              <dt className="text-xs text-muted">{r.label}</dt>
                              <dd className="font-medium break-words whitespace-pre-wrap">{r.value}</dd>
                            </div>
                          ))}
                          <div>
                            <dt className="text-xs text-muted">التاريخ</dt>
                            <dd className="font-medium">{formatDate(x.createdAt)} · {formatTime(x.createdAt)}</dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <select
                            value={x.status}
                            onChange={(e) => setStatus(x.id, e.target.value as RequestStatus)}
                            className="rounded-full bg-paper px-3 py-2 text-sm font-semibold ring-1 ring-ink/15 focus:outline-none"
                            aria-label="الحالة"
                          >
                            {statuses.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          {phone && (
                            <>
                              <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-signal px-3 py-2 text-sm font-semibold text-paper">
                                <MessageCircle className="size-4" /> واتساب
                              </a>
                              <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-2 text-sm font-semibold ring-1 ring-ink/15">
                                <Phone className="size-4" /> اتصال
                              </a>
                            </>
                          )}
                          <button type="button" onClick={() => remove(x.id)} className="mr-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-accent-deep hover:bg-accent-soft">
                            <Trash2 className="size-4" /> حذف
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
