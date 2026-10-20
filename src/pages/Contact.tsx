import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpLeft, CheckCircle2, Loader2, Mail, MessageCircle, Plus } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import Instagram from "../components/InstagramIcon";
import { Field, TextArea } from "../components/Field";
import { createContactMessage } from "../lib/api";
import { site } from "../data/site";

const subjects = ["سؤال عام", "فكرة جاهزة", "مشروع مخصص", "ورشة", "تعاون"];

const faqs = [
  { q: "شو بالضبط بستلم لما أشتري فكرة جاهزة؟", a: "ملف PDF فيه دراسة مختصرة للفكرة: رأس المال المطلوب، قائمة المعدات والموردين، حساب التكاليف والتسعير، وخطة إطلاق خطوة بخطوة — مع جلسة أسئلة قصيرة معنا." },
  { q: "شو الفرق بين الفكرة الجاهزة والمشروع المخصص؟", a: "الفكرة الجاهزة ملف مدروس مسبقاً وبتستلمه فوراً. المشروع المخصص منبنيه من الصفر حسب ميزانيتك ومدينتك وخبرتك، وبياخد وقت أطول لأنه فيه بحث خاص فيك." },
  { q: "هل الأرقام بالملفات مضمونة؟", a: "الأرقام تقديرات مبنية على بحث وتجارب حقيقية، بس كل سوق وكل موقع إله ظروفه. منساعدك تعدّل الأرقام على وضعك." },
  { q: "كيف بدفع؟", a: "حالياً بعد ما تبعت الطلب منتواصل معك ومنتفق على طريقة الدفع المناسبة إلك." },
  { q: "الورشات بتنفع إذا لسا ما عندي فكرة؟", a: "أكيد. ورشة «من الفكرة إلى الخطة» مصممة بالضبط لهيك حالة." },
];

export default function Contact() {
  const [subject, setSubject] = useState(subjects[0]);
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
    { icon: Instagram, label: "إنستغرام", value: `@${site.instagramHandle}`, href: site.instagramUrl, ltr: true },
    { icon: MessageCircle, label: "واتساب", value: site.whatsapp || "يُضاف لاحقاً", href: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : "", ltr: Boolean(site.whatsapp) },
    { icon: Mail, label: "الإيميل", value: site.email || "يُضاف لاحقاً", href: site.email ? `mailto:${site.email}` : "", ltr: Boolean(site.email) },
  ];

  return (
    <>
      <PageHeader eyebrow="تواصل معنا" title={<>خلّينا <span className="text-accent">نحكي.</span></>}>
        سؤال، فكرة، أو بدك تعرف من وين تبدأ؟ ابعتلنا ومنرد عليك بأقرب وقت.
      </PageHeader>

      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr]">
        {/* form */}
        <div className="rounded-3xl bg-card p-5 ring-1 ring-ink/10 sm:p-8">
          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                <CheckCircle2 className="mx-auto size-16 text-success" />
                <h2 className="mt-5 text-3xl font-black">وصلت رسالتك!</h2>
                <p className="mt-2 text-ink-soft">منرد عليك خلال يوم عمل.</p>
                <button type="button" onClick={() => setState("idle")} className="mt-6 text-sm font-semibold text-accent-deep hover:underline">
                  ابعت رسالة ثانية
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="space-y-5" exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black">ابعتلنا رسالة</h2>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">الموضوع</legend>
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
                  <Field label="الاسم" name="name" required minLength={2} autoComplete="name" />
                  <Field label="هاتف أو إيميل" name="contact" required dir="ltr" className="[&_input]:text-right" />
                </div>
                <TextArea label="رسالتك" name="message" required minLength={5} className="[&_textarea]:min-h-36" />
                {state === "error" && <p className="text-sm text-accent-deep">صار خطأ، جرّب مرة ثانية.</p>}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display font-bold text-paper transition-colors hover:bg-accent-deep disabled:opacity-70 sm:w-auto"
                >
                  {state === "sending" && <Loader2 className="size-4 animate-spin" />}
                  {state === "sending" ? "عم نرسل…" : "أرسل الرسالة"}
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
            <p className="relative mt-6 font-display text-2xl font-black">تابعنا على إنستغرام</p>
            <p className="relative mt-1 text-paper/60">أفكار وفرص جديدة كل أسبوع.</p>
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
      <Container className="pt-6">
        <p className="mb-3 font-mono text-xs text-accent-deep">/ أسئلة شائعة</p>
        <h2 className="mb-8 text-4xl font-black sm:text-5xl">قبل ما تسأل…</h2>
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
    </>
  );
}
