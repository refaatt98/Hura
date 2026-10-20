import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import type { CustomFormConfig, SiteInfo } from "../../types";
import { getSiteInfo, saveSiteInfo } from "../../lib/api";
import { useSite } from "../SiteProvider";
import Skeleton from "../Skeleton";
import { Field, TextArea } from "../Field";
import { defaultTexts, textGroups } from "../../data/texts";

/** One admin tab of site settings. `section` is "hero" | "contactinfo" | "customform" | "faq" | "texts:<groupId>". */
export default function SiteSettingsEditor({ section }: { section: string }) {
  const { reload } = useSite();
  const [s, setS] = useState<SiteInfo | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    getSiteInfo().then(setS);
  }, []);

  const group = section.startsWith("texts:") ? textGroups.find((g) => g.id === section.slice(6)) : undefined;

  if (!s) return <Skeleton className="h-96" />;

  const set = <K extends keyof SiteInfo>(k: K, v: SiteInfo[K]) => {
    setS({ ...s, [k]: v });
    setState("idle");
  };

  const cf = s.customForm;
  const setCf = <K extends keyof CustomFormConfig>(k: K, v: CustomFormConfig[K]) => set("customForm", { ...cf, [k]: v });
  const lines = (k: "fields" | "budgets" | "timelines" | "contactWays", label: string) => (
    <TextArea
      label={`${label} (كل خيار بسطر)`}
      value={cf[k].join("\n")}
      onChange={(e) => setCf(k, e.target.value.split("\n"))}
      className="[&_textarea]:min-h-28"
    />
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!s) return;
    setState("saving");
    try {
      await saveSiteInfo(s);
      reload();
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {section === "hero" && (
      <Section>
        <Field label="الشارة الصغيرة فوق العنوان" value={s.heroBadge} onChange={(e) => set("heroBadge", e.target.value)} />
        <Field label="السطر الأول من العنوان" required value={s.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
        <Field label="بداية السطر الثاني" value={s.heroPrefix} onChange={(e) => set("heroPrefix", e.target.value)} hint="بتيجي قبل الكلمة اللي بتتبدّل" />
        <TextArea
          label="الكلمات اللي بتتبدّل (كل كلمة بسطر)"
          value={s.heroWords.join("\n")}
          onChange={(e) => set("heroWords", e.target.value.split("\n"))}
          className="[&_textarea]:min-h-24"
        />
        <TextArea label="الوصف التعريفي" required value={s.about} onChange={(e) => set("about", e.target.value)} />
      </Section>
      )}

      {section === "contactinfo" && (
      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="حساب إنستغرام" value={s.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} dir="ltr" className="[&_input]:text-right" hint="بدون @ — مثلاً hura_business_projects" />
          <Field label="رقم الواتساب" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} dir="ltr" className="[&_input]:text-right" hint="مع رمز الدولة، مثلاً ‎+970599123456" />
          <Field label="الإيميل" type="email" value={s.email} onChange={(e) => set("email", e.target.value)} dir="ltr" className="[&_input]:text-right" />
          <Field label="المدينة" value={s.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <Field label="الجملة التعريفية (بالفوتر)" value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Section>
      )}

      {section === "customform" && (
      <Section>
        <p className="-mt-2 text-sm text-muted">نصوص الأسئلة والخيارات اللي بتظهر للزائر بصفحة المشروع المخصص.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-2xl bg-paper p-4">
            <Field label="سؤال المجال" value={cf.fieldQuestion} onChange={(e) => setCf("fieldQuestion", e.target.value)} />
            {lines("fields", "خيارات المجال")}
          </div>
          <div className="space-y-3 rounded-2xl bg-paper p-4">
            <Field label="سؤال الميزانية" value={cf.budgetQuestion} onChange={(e) => setCf("budgetQuestion", e.target.value)} />
            {lines("budgets", "خيارات الميزانية")}
          </div>
          <div className="space-y-3 rounded-2xl bg-paper p-4">
            <Field label="سؤال وقت البداية" value={cf.timelineQuestion} onChange={(e) => setCf("timelineQuestion", e.target.value)} />
            {lines("timelines", "خيارات وقت البداية")}
          </div>
          <div className="space-y-3 rounded-2xl bg-paper p-4">
            <Field label="سؤال طريقة التواصل" value={cf.contactQuestion} onChange={(e) => setCf("contactQuestion", e.target.value)} />
            {lines("contactWays", "طرق التواصل")}
          </div>
        </div>
        <Field label="عنوان خانة الفكرة المبدئية" value={cf.ideaQuestion} onChange={(e) => setCf("ideaQuestion", e.target.value)} />

        <h3 className="pt-2 font-display font-bold">خطوات «كيف منشتغل»</h3>
        {cf.steps.map((st, i) => (
          <div key={i} className="relative grid gap-3 rounded-2xl bg-paper p-4 pl-12 sm:grid-cols-[1fr_2fr]">
            <button
              type="button"
              onClick={() => setCf("steps", cf.steps.filter((_, k) => k !== i))}
              className="absolute top-3 left-3 grid size-8 place-items-center rounded-full text-accent-deep hover:bg-accent-soft"
              aria-label="حذف الخطوة"
            >
              <Trash2 className="size-4" />
            </button>
            <Field label={`خطوة ${i + 1}`} value={st.t} onChange={(e) => setCf("steps", cf.steps.map((x, k) => (k === i ? { ...x, t: e.target.value } : x)))} />
            <Field label="الوصف" value={st.d} onChange={(e) => setCf("steps", cf.steps.map((x, k) => (k === i ? { ...x, d: e.target.value } : x)))} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCf("steps", [...cf.steps, { t: "", d: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink"
        >
          <Plus className="size-4" /> خطوة جديدة
        </button>
        <Field label="ملاحظة تحت الخطوات" value={cf.note} onChange={(e) => setCf("note", e.target.value)} />
      </Section>
      )}

      {section === "faq" && (
      <Section>
        {s.faqs.map((f, i) => (
          <div key={i} className="relative space-y-3 rounded-2xl bg-paper p-4 pl-12">
            <button
              type="button"
              onClick={() => set("faqs", s.faqs.filter((_, k) => k !== i))}
              className="absolute top-3 left-3 grid size-8 place-items-center rounded-full text-accent-deep hover:bg-accent-soft"
              aria-label="حذف السؤال"
            >
              <Trash2 className="size-4" />
            </button>
            <Field label={`سؤال ${i + 1}`} value={f.q} onChange={(e) => set("faqs", s.faqs.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)))} />
            <TextArea label="الجواب" value={f.a} onChange={(e) => set("faqs", s.faqs.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)))} className="[&_textarea]:min-h-20" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("faqs", [...s.faqs, { q: "", a: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink"
        >
          <Plus className="size-4" /> سؤال جديد
        </button>
      </Section>
      )}

      {group && (
        <Section>
          {group.hint && <p className="-mt-2 text-sm text-muted">{group.hint}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((f) => {
              const value = s.texts[f.key] ?? defaultTexts[f.key] ?? "";
              const changed = value !== f.default;
              const props = {
                label: f.label,
                value,
                onChange: (e: { target: { value: string } }) => set("texts", { ...s.texts, [f.key]: e.target.value }),
              };
              const wide = f.multiline || f.list || f.label.length > 30;
              return (
                <div key={f.key} className={`relative ${wide ? "sm:col-span-2" : ""}`}>
                  {f.multiline || f.list ? <TextArea {...props} className="[&_textarea]:min-h-20" /> : <Field {...props} />}
                  {changed && (
                    <button
                      type="button"
                      onClick={() => set("texts", { ...s.texts, [f.key]: f.default })}
                      className="absolute top-0 left-0 text-xs text-muted hover:text-accent-deep"
                    >
                      رجّع الأصلي
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-1 sm:px-6">
          {state === "saved" && <span className="inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" /> انحفظ</span>}
          {state === "error" && <span className="text-sm text-accent-deep">ما انحفظ، جرّب مرة ثانية</span>}
          <button type="submit" disabled={state === "saving"} className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-display font-bold text-paper hover:bg-accent-deep disabled:opacity-70">
            {state === "saving" && <Loader2 className="size-4 animate-spin" />} حفظ التغييرات
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-ink/10">
      {title && <h2 className="text-lg font-black">{title}</h2>}
      {children}
    </section>
  );
}
