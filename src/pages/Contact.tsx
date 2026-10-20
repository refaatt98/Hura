import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpLeft, CheckCircle2, Loader2, Mail, MessageCircle, Plus } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import Instagram from "../components/InstagramIcon";
import { Field, TextArea } from "../components/Field";
import { createContactMessage } from "../lib/api";
import { Hl, useSite } from "../components/SiteProvider";



export default function Contact() {
  const { site, t, tl } = useSite();
  const subjects = tl("contact.subjects");
  const faqs = site.faqs;
  const [picked, setSubject] = useState("");
  const subject = picked || subjects[0] || "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [open, setOpen] = useState<number | null>(0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState("sending");
    try {
      await createContactMessage({
        name: String(f.get("name")).trim(),
        contact: String(f.get("contact")).trim(),
        subject,
        message: String(f.get("message")).trim(),
      });
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const channels = [
    { icon: Instagram, label: t("contact.instagram"), value: `@${site.instagramHandle}`, href: site.instagramUrl, ltr: true },
    { icon: MessageCircle, label: t("contact.whatsapp"), value: site.whatsapp || t("contact.soon"), href: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : "", ltr: Boolean(site.whatsapp) },
    { icon: Mail, label: t("contact.email"), value: site.email || t("contact.soon"), href: site.email ? `mailto:${site.email}` : "", ltr: Boolean(site.email) },
  ];

  return (
    <>
      <PageHeader eyebrow={t("contact.eyebrow")} title={<Hl text={t("contact.title")} hl={t("contact.titleHl")} />}>
        {t("contact.intro")}
      </PageHeader>

      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr]">
        {/* form */}
        <div className="rounded-3xl bg-card p-5 ring-1 ring-ink/10 sm:p-8">
          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                <CheckCircle2 className="mx-auto size-16 text-success" />
                <h2 className="mt-5 text-3xl font-black">{t("contact.successTitle")}</h2>
                <p className="mt-2 text-ink-soft">{t("contact.successText")}</p>
                <button type="button" onClick={() => setState("idle")} className="mt-6 text-sm font-semibold text-accent-deep hover:underline">
                  {t("contact.again")}
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="space-y-5" exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black">{t("contact.formTitle")}</h2>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">{t("contact.subjectLabel")}</legend>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        aria-pressed={subject === s}
                        className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors ${
                          subject === s ? "bg-ink text-paper ring-ink" : "bg-paper ring-ink/10 hover:ring-ink"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("form.name")} name="name" required minLength={2} autoComplete="name" />
                  <Field label={t("contact.contactField")} name="contact" required dir="ltr" className="[&_input]:text-right" />
                </div>
                <TextArea label={t("contact.messageField")} name="message" required minLength={5} className="[&_textarea]:min-h-36" />
                {state === "error" && <p className="text-sm text-accent-deep">{t("form.error")}</p>}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display font-bold text-paper transition-colors hover:bg-accent-deep disabled:opacity-70 sm:w-auto"
                >
                  {state === "sending" && <Loader2 className="size-4 animate-spin" />}
                  {state === "sending" ? t("form.sending") : t("contact.submit")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* channels */}
        <div className="space-y-3">
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group grid-lines relative block overflow-hidden rounded-3xl bg-ink p-6 text-paper"
          >
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-accent/40 blur-3xl" />
            <Instagram className="relative size-8 text-accent" />
            <p className="relative mt-6 font-display text-2xl font-black">{t("contact.igTitle")}</p>
            <p className="relative mt-1 text-paper/60">{t("contact.igText")}</p>
            <span dir="ltr" className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-bold text-ink transition-colors group-hover:bg-accent group-hover:text-paper">
              @{site.instagramHandle} <ArrowUpLeft className="size-4" />
            </span>
          </a>
          {channels.slice(1).map((c) => {
            const inner = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-deep">
                  <c.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-muted">{c.label}</span>
                  <span dir={c.ltr ? "ltr" : undefined} className={`block font-display font-bold ${c.href ? "" : "text-muted"}`}>{c.value}</span>
                </span>
              </>
            );
            return c.href ? (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-ink/10 hover:ring-ink">
                {inner}
              </a>
            ) : (
              <div key={c.label} className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-ink/10">{inner}</div>
            );
          })}
        </div>
      </Container>

      {/* FAQ */}
      {faqs.length > 0 && (
      <Container className="pt-6">
        <p className="mb-3 font-mono text-xs text-accent-deep">/ {t("contact.faqEyebrow")}</p>
        <h2 className="mb-8 text-4xl font-black sm:text-5xl">{t("contact.faqTitle")}</h2>
        <div className="border-t-2 border-ink">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b-2 border-ink">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 py-5 text-right"
              >
                <span className="font-display text-lg font-bold sm:text-xl">{f.q}</span>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ring-2 ring-ink transition-transform duration-300 ${open === i ? "rotate-45 bg-ink text-paper" : ""}`}>
                  <Plus className="size-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="max-w-3xl pb-6 leading-relaxed text-ink-soft">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Container>
      )}
    </>
  );
}
