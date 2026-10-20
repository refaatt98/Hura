import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import ButtonLink from "../components/ButtonLink";
import { Field, TextArea } from "../components/Field";
import { createCustomRequest } from "../lib/api";
import type { NewCustomRequest } from "../types";

const fields = ["أكل ومشروبات", "تجارة إلكترونية", "خدمات", "تعليم وتدريب", "تجميل وموضة", "صناعة وحِرف", "تقنية", "مش متأكد"];
const budgets = ["أقل من 10,000 ₪", "بين 10,000 و 35,000 ₪", "بين 35,000 و 100,000 ₪", "أكثر من 100,000 ₪"];
const timelines = ["خلال شهر", "من 1 إلى 3 أشهر", "من 3 إلى 6 أشهر", "لسا بستكشف"];
const contactWays = ["واتساب", "اتصال", "إيميل"];

const steps = ["المجال", "الميزانية", "معلوماتك", "المراجعة"];

const process = [
  { n: "01", t: "بنسمعك", d: "منحكي معك 20 دقيقة عن وضعك وأهدافك." },
  { n: "02", t: "بنبحث", d: "مندرس السوق بمدينتك والفرص المناسبة لميزانيتك." },
  { n: "03", t: "بنسلّمك الملف", d: "ملف فرصة كامل بالأرقام وخطة إطلاق خطوة بخطوة." },
];

const empty: NewCustomRequest = { field: "", idea: "", budget: "", city: "", timeline: "", name: "", phone: "", email: "", contactVia: "واتساب" };

export default function CustomProject() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<NewCustomRequest>(empty);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = <K extends keyof NewCustomRequest>(k: K, v: NewCustomRequest[K]) => setData((d) => ({ ...d, [k]: v }));

  const canNext = [
    Boolean(data.field),
    Boolean(data.budget && data.timeline && data.city.trim()),
    data.name.trim().length >= 2 && /^[0-9+\s-]{7,}$/.test(data.phone.trim()),
    true,
  ][step];

  const go = (d: number) => {
    setDir(d);
    setStep((s) => s + d);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step < steps.length - 1) {
      if (canNext) go(1);
      return;
    }
    setState("sending");
    try {
      await createCustomRequest({ ...data, email: data.email?.trim() || undefined });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <PageHeader eyebrow="مشروع مخصص" title={<>مشروعك، <span className="text-accent">على مقاسك.</span></>}>
        احكيلنا عن حالك بأربع خطوات قصيرة، ومنرجعلك خلال 48 ساعة لنحدد موعد أول جلسة.
      </PageHeader>

      <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {state === "sent" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-card p-8 text-center ring-1 ring-ink/10 sm:p-12"
            >
              <CheckCircle2 className="mx-auto size-16 text-success" />
              <h2 className="mt-5 text-3xl font-black">وصل طلبك يا {data.name.split(" ")[0]}!</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-soft">
                رح نتواصل معك عبر {data.contactVia} خلال 48 ساعة لنحدد موعد الجلسة الأولى.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink to="/ideas">تصفّح الأفكار الجاهزة</ButtonLink>
                <ButtonLink to="/" variant="ghost">الرئيسية</ButtonLink>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10">
              {/* progress */}
              <div className="bg-ink px-5 py-4 text-paper sm:px-8">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-paper/50">خطوة {step + 1} / {steps.length}</span>
                  <span className="font-display font-bold">{steps[step]}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {steps.map((s, i) => (
                    <span key={s} className="h-1.5 overflow-hidden rounded-full bg-paper/15">
                      <motion.span
                        className="block h-full bg-accent"
                        initial={false}
                        animate={{ width: i <= step ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[380px] p-5 sm:p-8">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * 40 }}
                    transition={{ duration: 0.25 }}
                  >
                    {step === 0 && (
                      <div className="space-y-6">
                        <Question title="بأي مجال حابب تشتغل؟">
                          <Choices options={fields} value={data.field} onChange={(v) => set("field", v)} />
                        </Question>
                        <TextArea
                          label="عندك فكرة مبدئية؟ احكيلنا عنها"
                          value={data.idea}
                          onChange={(e) => set("idea", e.target.value)}
                          placeholder="مثلاً: بدي محل صغير بيبيع… أو ما عندي فكرة بعد، بس عندي خبرة بـ…"
                        />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <Question title="قديش الميزانية المتوفرة؟">
                          <Choices options={budgets} value={data.budget} onChange={(v) => set("budget", v)} cols={2} />
                        </Question>
                        <Question title="إمتى ناوي تبدأ؟">
                          <Choices options={timelines} value={data.timeline} onChange={(v) => set("timeline", v)} cols={4} />
                        </Question>
                        <Field label="المدينة" required value={data.city} onChange={(e) => set("city", e.target.value)} placeholder="مثلاً: رام الله" />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="الاسم الكامل" required value={data.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                        <Field
                          label="رقم الهاتف / واتساب"
                          required
                          type="tel"
                          dir="ltr"
                          className="[&_input]:text-right"
                          value={data.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          autoComplete="tel"
                        />
                        <Field
                          label="الإيميل"
                          type="email"
                          dir="ltr"
                          className="sm:col-span-2 [&_input]:text-right"
                          value={data.email}
                          onChange={(e) => set("email", e.target.value)}
                          hint="اختياري"
                        />
                        <div className="sm:col-span-2">
                          <Question title="كيف بتحب نتواصل معك؟">
                            <Choices options={contactWays} value={data.contactVia} onChange={(v) => set("contactVia", v)} cols={3} />
                          </Question>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 className="mb-5 text-2xl font-extrabold">راجع طلبك</h3>
                        <dl className="divide-y divide-dashed divide-line rounded-2xl bg-paper px-5">
                          {[
                            ["المجال", data.field, 0],
                            ["الفكرة", data.idea || "—", 0],
                            ["الميزانية", data.budget, 1],
                            ["البداية", data.timeline, 1],
                            ["المدينة", data.city, 1],
                            ["الاسم", data.name, 2],
                            ["الهاتف", data.phone, 2],
                            ["التواصل عبر", data.contactVia, 2],
                          ].map(([k, v, s]) => (
                            <div key={k as string} className="flex items-start justify-between gap-4 py-3 text-sm">
                              <dt className="shrink-0 text-muted">{k}</dt>
                              <dd className="min-w-0 text-left font-medium break-words">
                                {v}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDir(-1);
                                    setStep(s as number);
                                  }}
                                  className="mr-2 text-xs text-accent-deep underline-offset-2 hover:underline"
                                >
                                  تعديل
                                </button>
                              </dd>
                            </div>
                          ))}
                        </dl>
                        {state === "error" && <p className="mt-4 text-sm text-accent-deep">صار خطأ، جرّب مرة ثانية.</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink disabled:invisible"
                >
                  <ArrowRight className="size-4" /> رجوع
                </button>
                <button
                  type="submit"
                  disabled={!canNext || state === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-display text-sm font-bold text-paper transition-colors hover:bg-accent-deep disabled:bg-line disabled:text-muted"
                >
                  {state === "sending" && <Loader2 className="size-4 animate-spin" />}
                  {step < steps.length - 1 ? "التالي" : state === "sending" ? "عم نرسل…" : "أرسل الطلب"}
                  {step < steps.length - 1 && <ArrowLeft className="size-4" />}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 font-mono text-xs text-accent-deep">/ كيف منشتغل</p>
          <ol className="space-y-3">
            {process.map((p) => (
              <li key={p.n} className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-ink/10">
                <span className="font-mono text-sm text-accent-deep">{p.n}</span>
                <div>
                  <p className="font-display font-bold">{p.t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-muted">بياناتك بتضل عندنا وما منشاركها مع حدا.</p>
        </aside>
      </Container>
    </>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-lg font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Choices({ options, value, onChange, cols = 4 }: { options: string[]; value: string; onChange: (v: string) => void; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "sm:grid-cols-2", 3: "grid-cols-3", 4: "sm:grid-cols-4" }[cols];
  return (
    <div className={`grid grid-cols-2 gap-2 ${grid}`}>
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-2xl px-3 py-3 text-sm font-semibold ring-1 transition-all ${
            value === o ? "bg-ink text-paper ring-ink" : "bg-paper text-ink ring-ink/10 hover:ring-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
