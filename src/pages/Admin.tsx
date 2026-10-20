import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Inbox,
  Image as ImageIcon,
  Type,
  Phone,
  HelpCircle,
  ClipboardList,
  Home as HomeIcon,
  LayoutDashboard,
  Mail,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import Logo from "../components/Logo";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import SubmissionsPanel from "../components/admin/SubmissionsPanel";
import IdeaEditor from "../components/admin/IdeaEditor";
import WorkshopEditor from "../components/admin/WorkshopEditor";
import StatusBadge from "../components/admin/StatusBadge";
import InstagramManager from "../components/admin/InstagramManager";
import SiteSettingsEditor from "../components/admin/SiteSettingsEditor";
import {
  deleteIdea,
  deleteWorkshop,
  getIdeas,
  getSubmissions,
  getWorkshops,
  saveIdea,
} from "../lib/api";
import { formatDate, money } from "../lib/format";
import { textGroups } from "../data/texts";
import type { Idea, RequestStatus, SubmissionKind, Workshop } from "../types";

type Tab = string;

interface TabDef {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const tabGroups: { title: string; tabs: TabDef[] }[] = [
  {
    title: "الطلبات",
    tabs: [
      { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
      { id: "orders", label: "طلبات الأفكار", icon: ShoppingBag },
      { id: "custom", label: "مشاريع مخصصة", icon: Sparkles },
      { id: "registrations", label: "تسجيلات الورشات", icon: Users },
      { id: "messages", label: "الرسائل", icon: Mail },
    ],
  },
  {
    title: "المحتوى",
    tabs: [
      { id: "ideas", label: "الأفكار", icon: FileText },
      { id: "workshops", label: "الورشات", icon: CalendarDays },
      { id: "instagram", label: "منشورات إنستغرام", icon: ImageIcon },
    ],
  },
  {
    title: "الإعدادات",
    tabs: [
      { id: "hero", label: "القسم الأول بالرئيسية", icon: HomeIcon },
      { id: "contactinfo", label: "معلومات التواصل", icon: Phone },
      { id: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
      { id: "customform", label: "نموذج مشروع مخصص", icon: ClipboardList },
    ],
  },
  {
    title: "نصوص الموقع",
    tabs: textGroups.map((g) => ({ id: `texts:${g.id}`, label: g.label, icon: Type })),
  },
];

const tabs: TabDef[] = tabGroups.flatMap((g) => g.tabs);
const settingsTabs = new Set(["hero", "contactinfo", "faq", "customform"]);

const submissionKinds: SubmissionKind[] = ["orders", "custom", "registrations", "messages"];

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = tabs.find((t) => t.id === params.get("tab"))?.id ?? "overview";
  const [newCounts, setNewCounts] = useState<Partial<Record<SubmissionKind, number>>>({});

  const refreshCounts = useCallback(() => {
    Promise.all(submissionKinds.map((k) => getSubmissions(k)))
      .then((lists) =>
        setNewCounts(Object.fromEntries(submissionKinds.map((k, i) => [k, lists[i].filter((x) => x.status === "جديد").length]))),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts, tab]);

  const go = (t: Tab) => setParams(t === "overview" ? {} : { tab: t });
  const current = tabs.find((t) => t.id === tab)!;

  return (
    <div className="min-h-dvh bg-paper">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-paper sm:inline">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-paper-deep">
              <ExternalLink className="size-4" /> <span className="hidden sm:inline">الموقع</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        {/* nav: dropdown on mobile, grouped sidebar on desktop */}
        <label className="lg:hidden">
          <span className="sr-only">القسم</span>
          <select
            value={tab}
            onChange={(e) => go(e.target.value)}
            className="w-full rounded-2xl bg-ink px-4 py-3.5 font-display font-bold text-paper focus:outline-none"
          >
            {tabGroups.map((g) => (
              <optgroup key={g.title} label={g.title}>
                {g.tabs.map((t) => {
                  const n = newCounts[t.id as SubmissionKind];
                  return (
                    <option key={t.id} value={t.id}>
                      {t.label}
                      {n ? ` (${n} جديد)` : ""}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </label>

        <nav
          className="hidden space-y-5 lg:sticky lg:top-22 lg:block lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-6"
          aria-label="أقسام الإدارة"
        >
          {tabGroups.map((g) => (
            <div key={g.title}>
              <p className="mb-1.5 px-3 text-xs font-semibold text-muted">{g.title}</p>
              <div className="space-y-0.5">
                {g.tabs.map((t) => {
                  const n = newCounts[t.id as SubmissionKind];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => go(t.id)}
                      aria-current={tab === t.id ? "page" : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-right text-sm font-semibold transition-colors ${
                        tab === t.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-card"
                      }`}
                    >
                      <t.icon className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{t.label}</span>
                      {Boolean(n) && <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] text-paper">{n}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <main className="min-w-0">
          <h1 className="mb-6 text-3xl font-black">{current.label}</h1>
          {tab === "overview" && <Overview go={go} />}
          {submissionKinds.includes(tab as SubmissionKind) && <SubmissionsPanel key={tab} kind={tab as SubmissionKind} onChange={refreshCounts} />}
          {tab === "ideas" && <IdeasManager />}
          {tab === "workshops" && <WorkshopsManager />}
          {tab === "instagram" && <InstagramManager />}
          {(settingsTabs.has(tab) || tab.startsWith("texts:")) && <SiteSettingsEditor key={tab} section={tab} />}
        </main>
      </div>
    </div>
  );
}

/* ───────── Overview ───────── */

interface Activity {
  kind: SubmissionKind;
  id: string;
  who: string;
  what: string;
  at: string;
  status: RequestStatus;
}

function Overview({ go }: { go: (t: Tab) => void }) {
  const [data, setData] = useState<{ counts: Record<SubmissionKind, [number, number]>; ideas: number; workshops: number; recent: Activity[] } | null>(null);

  useEffect(() => {
    Promise.all([
      getSubmissions("orders"),
      getSubmissions("custom"),
      getSubmissions("registrations"),
      getSubmissions("messages"),
      getIdeas(),
      getWorkshops(),
    ]).then(([orders, custom, regs, msgs, ideas, workshops]) => {
      const recent: Activity[] = [
        ...orders.map((x) => ({ kind: "orders" as const, id: x.id, who: x.name, what: `طلب ملف «${x.ideaTitle}»`, at: x.createdAt, status: x.status })),
        ...custom.map((x) => ({ kind: "custom" as const, id: x.id, who: x.name, what: `مشروع مخصص · ${x.field}`, at: x.createdAt, status: x.status })),
        ...regs.map((x) => ({ kind: "registrations" as const, id: x.id, who: x.name, what: `تسجيل بورشة «${x.workshopTitle}»`, at: x.createdAt, status: x.status })),
        ...msgs.map((x) => ({ kind: "messages" as const, id: x.id, who: x.name, what: `رسالة · ${x.subject}`, at: x.createdAt, status: x.status })),
      ]
        .sort((p, q) => q.at.localeCompare(p.at))
        .slice(0, 8);
      const c = (l: { status: RequestStatus }[]): [number, number] => [l.length, l.filter((x) => x.status === "جديد").length];
      setData({
        counts: { orders: c(orders), custom: c(custom), registrations: c(regs), messages: c(msgs) },
        ideas: ideas.length,
        workshops: workshops.length,
        recent,
      });
    });
  }, []);

  if (!data) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>;

  const cards: { kind: SubmissionKind; label: string; icon: LucideIcon }[] = [
    { kind: "orders", label: "طلبات الأفكار", icon: ShoppingBag },
    { kind: "custom", label: "مشاريع مخصصة", icon: Sparkles },
    { kind: "registrations", label: "تسجيلات", icon: Users },
    { kind: "messages", label: "رسائل", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-2xl bg-flap-amber/20 p-4 text-sm ring-1 ring-flap-amber/50">
        <TriangleAlert className="size-5 shrink-0 text-accent-deep" />
        <p className="leading-relaxed">
          <b>بدون تسجيل دخول:</b> هالصفحة مفتوحة لأي حدا بيعرف رابطها. لا تشارك الرابط، وفعّل تسجيل الدخول قبل ما الموقع ينتشر.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((c) => {
          const [total, fresh] = data.counts[c.kind];
          return (
            <button key={c.kind} type="button" onClick={() => go(c.kind)} className="rounded-2xl bg-card p-4 text-right ring-1 ring-ink/10 transition-all hover:ring-ink sm:p-5">
              <div className="flex items-center justify-between">
                <c.icon className="size-5 text-accent-deep" />
                {fresh > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-paper">{fresh} جديد</span>}
              </div>
              <p className="mt-4 font-mono text-3xl font-semibold">{total}</p>
              <p className="text-sm text-muted">{c.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => go("ideas")} className="flex items-center justify-between rounded-2xl bg-ink p-5 text-right text-paper">
          <span>
            <span className="block font-mono text-3xl font-semibold text-flap-amber">{data.ideas}</span>
            <span className="text-sm text-paper/60">فكرة منشورة</span>
          </span>
          <FileText className="size-8 text-paper/30" />
        </button>
        <button type="button" onClick={() => go("workshops")} className="flex items-center justify-between rounded-2xl bg-ink p-5 text-right text-paper">
          <span>
            <span className="block font-mono text-3xl font-semibold text-flap-amber">{data.workshops}</span>
            <span className="text-sm text-paper/60">ورشة</span>
          </span>
          <CalendarDays className="size-8 text-paper/30" />
        </button>
      </div>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-ink/10">
        <h2 className="mb-4 text-lg font-black">آخر النشاطات</h2>
        {data.recent.length === 0 ? (
          <div className="py-10 text-center text-muted">
            <Inbox className="mx-auto size-8" />
            <p className="mt-2 text-sm">لسا ما وصل شي. جرّب تبعت طلب من الموقع.</p>
          </div>
        ) : (
          <ul className="divide-y divide-dashed divide-line">
            {data.recent.map((a) => (
              <li key={a.kind + a.id}>
                <button type="button" onClick={() => go(a.kind)} className="flex w-full items-center gap-3 py-3 text-right">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{a.who}</span>
                    <span className="block truncate text-sm text-ink-soft">{a.what}</span>
                  </span>
                  <StatusBadge status={a.status} />
                  <span className="hidden text-xs text-muted sm:block">{formatDate(a.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ───────── Ideas manager ───────── */

function IdeasManager() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [editing, setEditing] = useState<Idea | "new" | null>(null);
  const load = () => getIdeas().then(setIdeas);
  useEffect(() => {
    load();
  }, []);

  async function toggleFeatured(i: Idea) {
    const next = { ...i, featured: !i.featured };
    setIdeas((xs) => xs?.map((x) => (x.id === i.id ? next : x)) ?? null);
    await saveIdea(next);
  }

  async function remove(i: Idea) {
    if (!confirm(`حذف «${i.title}»؟`)) return;
    setIdeas((xs) => xs?.filter((x) => x.id !== i.id) ?? null);
    await deleteIdea(i.id);
  }

  return (
    <>
      <ManagerToolbar count={ideas?.length} unit="فكرة" onAdd={() => setEditing("new")} addLabel="فكرة جديدة" />
      {!ideas ? (
        <Skeleton className="h-64" />
      ) : (
        <ul className="space-y-2">
          {ideas.map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-ink/10 sm:p-4">
              <span className="hidden rounded-md bg-ink px-2 py-1 font-mono text-[11px] text-flap-amber sm:block">{i.code}</span>
              <Link to={`/ideas/${i.id}`} target="_blank" className="min-w-0 flex-1">
                <span className="block truncate font-display font-bold hover:text-accent-deep">{i.title}</span>
                <span className="block truncate text-xs text-muted">{i.category} · {money(i.price)}</span>
              </Link>
              <IconBtn label={i.featured ? "إلغاء التمييز" : "تمييز"} onClick={() => toggleFeatured(i)} active={i.featured}>
                <Star className={`size-4 ${i.featured ? "fill-current" : ""}`} />
              </IconBtn>
              <IconBtn label="تعديل" onClick={() => setEditing(i)}><Pencil className="size-4" /></IconBtn>
              <IconBtn label="حذف" onClick={() => remove(i)} danger><Trash2 className="size-4" /></IconBtn>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "فكرة جديدة" : "تعديل الفكرة"} wide>
        {editing !== null && (
          <IdeaEditor
            idea={editing === "new" ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>
    </>
  );
}

/* ───────── Workshops manager ───────── */

function WorkshopsManager() {
  const [list, setList] = useState<Workshop[] | null>(null);
  const [editing, setEditing] = useState<Workshop | "new" | null>(null);
  const load = () => getWorkshops().then(setList);
  useEffect(() => {
    load();
  }, []);

  async function remove(w: Workshop) {
    if (!confirm(`حذف «${w.title}»؟`)) return;
    setList((xs) => xs?.filter((x) => x.id !== w.id) ?? null);
    await deleteWorkshop(w.id);
  }

  return (
    <>
      <ManagerToolbar count={list?.length} unit="ورشة" onAdd={() => setEditing("new")} addLabel="ورشة جديدة" />
      {!list ? (
        <Skeleton className="h-64" />
      ) : (
        <ul className="space-y-2">
          {list.map((w) => (
            <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-ink/10 sm:p-4">
              <Link to={`/workshops/${w.id}`} target="_blank" className="min-w-0 flex-1">
                <span className="block truncate font-display font-bold hover:text-accent-deep">{w.title}</span>
                <span className="block truncate text-xs text-muted">
                  {formatDate(w.date)} · {w.mode} · {w.seatsTaken}/{w.seats} مقعد · {money(w.price)}
                </span>
              </Link>
              <IconBtn label="تعديل" onClick={() => setEditing(w)}><Pencil className="size-4" /></IconBtn>
              <IconBtn label="حذف" onClick={() => remove(w)} danger><Trash2 className="size-4" /></IconBtn>
            </li>
          ))}
        </ul>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "ورشة جديدة" : "تعديل الورشة"} wide>
        {editing !== null && (
          <WorkshopEditor
            workshop={editing === "new" ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>
    </>
  );
}

function ManagerToolbar({ count, unit, onAdd, addLabel }: { count?: number; unit: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm text-muted"><span className="font-mono">{count ?? "…"}</span> {unit}</span>
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-paper hover:bg-accent-deep">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

function IconBtn({ label, onClick, children, danger, active }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
        danger ? "text-accent-deep hover:bg-accent-soft" : active ? "bg-flap-amber/30 text-ink" : "text-ink-soft hover:bg-paper-deep"
      }`}
    >
      {children}
    </button>
  );
}
