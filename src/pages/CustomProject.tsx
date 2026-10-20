import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import ButtonLink from "../components/ButtonLink";
import { Field, TextArea } from "../components/Field";
import { createCustomRequest } from "../lib/api";
import { Hl, useSite } from "../components/SiteProvider";
import type { NewCustomRequest } from "../types";

/** The form always has 4 steps; their names are editable texts (custom.steps). */
const steps = [0, 1, 2, 3];

const empty: NewCustomRequest = { field: "", idea: "", budget: "", city: "", timeline: "", name: "", phone: "", contactVia: "" };

export default function CustomProject() {
  const { site, t, tl } = useSite();
  const cf = site.customForm;
  const stepNames = tl("custom.steps");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<NewCustomRequest>(empty);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = <K extends keyof NewCustomRequest>(k: K, v: NewCustomRequest[K]) => setData((d) => ({ ...d, [k]: v }));

  const canNext = [
    Boolean(data.field) || cf.fields.length === 0,
    (Boolean(data.budget) || cf.budgets.length === 0) && (Boolean(data.timeline) || cf.timelines.length === 0) && Boolean(data.city.trim()),
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
      await createCustomRequest({ ...data, contactVia: data.contactVia || cf.contactWays[0] || "" });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <PageHeader eyebrow={t("custom.eyebrow")} title={<Hl text={t("custom.title")} hl={t("custom.titleHl")} />}>
        {t("custom.intro")}
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
              <h2 className="mt-5 text-3xl font-black">{t("custom.successTitle", { name: data.name.split(" ")[0] })}</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-soft">
                {t("custom.successText", { via: data.contactVia || cf.contactWays[0] || "الهاتف" })}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink to="/ideas">{t("custom.browseIdeas")}</ButtonLink>
                <ButtonLink to="/" variant="ghost">{t("custom.home")}</ButtonLink>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10">
              {/* progress */}
              <div className="bg-ink px-5 py-4 text-paper sm:px-8">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-paper/50">{t("custom.stepLabel")} {step + 1} / {steps.length}</span>
                  <span className="font-display font-bold">{stepNames[step] ?? ""}</span>
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
                        {cf.fields.length > 0 && (
                        <Question title={cf.fieldQuestion}>
                          <Choices options={cf.fields} value={data.field} onChange={(v) => set("field", v)} />
                        </Question>
                        )}
                        <TextArea
                          label={cf.ideaQuestion}
                          value={data.idea}
                          onChange={(e) => set("idea", e.target.value)}
                          placeholder={t("custom.ideaPlaceholder")}
                        />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        {cf.budgets.length > 0 && (
                        <Question title={cf.budgetQuestion}>
                          <Choices options={cf.budgets} value={data.budget} onChange={(v) => set("budget", v)} cols={2} />
                        </Question>
                        )}
                        {cf.timelines.length > 0 && (
                        <Question title={cf.timelineQuestion}>
                          <Choices options={cf.timelines} value={data.timeline} onChange={(v) => set("timeline", v)} cols={4} />
                        </Question>
                        )}
                        <Field label={t("form.city")} required value={data.city} onChange={(e) => set("city", e.target.value)} placeholder={t("custom.cityPlaceholder")} />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("form.fullName")} required value={data.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                        <Field
                          label={t("form.phone")}
                          required
                          type="tel"
                          dir="ltr"
                          className="[&_input]:text-right"
                          value={data.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          autoComplete="tel"
                        />
                        {cf.contactWays.length > 0 && (
                          <div className="sm:col-span-2">
                            <Question title={cf.contactQuestion}>
                              <Choices options={cf.contactWays} value={data.contactVia || cf.contactWays[0]} onChange={(v) => set("contactVia", v)} cols={3} />
                            </Question>
                          </div>
                        )}
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 className="mb-5 text-2xl font-extrabold">{t("custom.reviewTitle")}</h3>
                        <dl className="divide-y divide-dashed divide-line rounded-2xl bg-paper px-5">
                          {[
                            [t("custom.rField"), data.field, 0],
                            [t("custom.rIdea"), data.idea || "—", 0],
                            [t("custom.rBudget"), data.budget, 1],
                            [t("custom.rTimeline"), data.timeline, 1],
                            [t("custom.rCity"), data.city, 1],
                            [t("custom.rName"), data.name, 2],
                            [t("custom.rPhone"), data.phone, 2],
                            [t("custom.rVia"), data.contactVia || cf.contactWays[0] || "—", 2],
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
                                  {t("custom.edit")}
                                </button>
                              </dd>
                            </div>
                          ))}
                        </dl>
                        {state === "error" && <p className="mt-4 text-sm text-accent-deep">{t("form.error")}</p>}
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
                  <ArrowRight className="size-4" /> {t("custom.back")}
                </button>
                <button
                  type="submit"
                  disabled={!canNext || state === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-display text-sm font-bold text-paper transition-colors hover:bg-accent-deep disabled:bg-line disabled:text-muted"
                >
                  {state === "sending" && <Loader2 className="size-4 animate-spin" />}
                  {step < steps.length - 1 ? t("custom.next") : state === "sending" ? t("form.sending") : t("custom.submit")}
                  {step < steps.length - 1 && <ArrowLeft className="size-4" />}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 font-mono text-xs text-accent-deep">/ {t("custom.processTitle")}</p>
          <ol className="space-y-3">
            {cf.steps.map((p, i) => (
              <li key={i} className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-ink/10">
                <span className="font-mono text-sm text-accent-deep">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display font-bold">{p.t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
          {cf.note && <p className="mt-4 text-xs leading-relaxed text-muted">{cf.note}</p>}
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
