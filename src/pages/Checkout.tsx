import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2, Lock, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import ButtonLink from "../components/ButtonLink";
import { Field, TextArea } from "../components/Field";
import { useCart } from "../components/CartProvider";
import { Hl, useSite } from "../components/SiteProvider";
import { createIdeaOrder, newOrderCode } from "../lib/api";
import { money } from "../lib/format";
import { orderMessage, whatsappLink } from "../lib/whatsapp";

const OWNER_WHATSAPP_FALLBACK = "+972527659449";

export default function Checkout() {
  const { items, total, remove, clear } = useCart();
  const { site, t, tl } = useSite();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; link: string } | null>(null);

  const phoneTo = site.whatsapp || OWNER_WHATSAPP_FALLBACK;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    const f = new FormData(e.currentTarget);
    const order = {
      code: newOrderCode(),
      items,
      total,
      name: String(f.get("name")).trim(),
      phone: String(f.get("phone")).trim(),
      address: String(f.get("address")).trim(),
      notes: String(f.get("notes") ?? "").trim() || undefined,
    };
    const link = whatsappLink(phoneTo, orderMessage({ ...order, header: t("wa.header"), footer: t("wa.footer") }));

    // Open the WhatsApp tab right away (inside the click) so popup blockers allow it.
    const tab = window.open("", "_blank");
    setState("sending");
    setError("");
    try {
      await createIdeaOrder(order);
      clear();
      setDone({ code: order.code, link });
      setState("sent");
      window.scrollTo({ top: 0 });
      if (tab) tab.location.href = link;
      else window.location.href = link;
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : t("form.error"));
      setState("error");
    }
  }

  if (state === "sent" && done) {
    return (
      <Container className="pt-36 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl rounded-3xl bg-card p-8 text-center ring-1 ring-ink/10 shadow-[0_30px_60px_-30px_rgb(var(--shadow-rgb)/.5)] sm:p-12"
        >
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h1 className="mt-5 text-4xl font-black">{t("checkout.successTitle")}</h1>
          <p className="mt-3 text-lg text-ink-soft">{t("checkout.successText", { code: done.code })}</p>
          <p dir="ltr" className="mx-auto mt-5 inline-block rounded-xl bg-ink px-4 py-2 font-mono text-lg font-semibold text-flap-amber">
            {done.code}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={done.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] py-4 font-display font-bold text-white hover:brightness-95"
            >
              <MessageCircle className="size-5" /> {t("checkout.whatsappButton")}
            </a>
            <ButtonLink to="/" variant="ghost" className="py-4">
              {t("checkout.backHome")}
            </ButtonLink>
          </div>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      <PageHeader eyebrow={t("checkout.eyebrow")} title={<Hl text={t("checkout.title")} hl={t("checkout.titleHl")} />}>
        {t("checkout.intro")}
      </PageHeader>

      <Container className="py-12">
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center">
            <ShoppingBag className="mx-auto size-12 text-line" />
            <p className="mt-4 font-display text-2xl font-bold">{t("cart.empty")}</p>
            <p className="mt-2 text-ink-soft">{t("cart.emptyText")}</p>
            <ButtonLink to="/ideas" className="mt-6">
              {t("cart.browse")} <ArrowLeft className="size-4" />
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
            {/* form */}
            <form onSubmit={submit} className="order-2 space-y-5 rounded-3xl bg-card p-5 ring-1 ring-ink/10 sm:p-8 lg:order-1">
              <h2 className="text-2xl font-black">{t("checkout.formTitle")}</h2>
              <Field label={t("checkout.name")} name="name" required minLength={2} maxLength={100} autoComplete="name" />
              <Field
                label={t("checkout.phone")}
                name="phone"
                type="tel"
                required
                dir="ltr"
                className="[&_input]:text-right"
                pattern="[0-9+\s\-]{7,}"
                title="رقم هاتف صحيح"
                autoComplete="tel"
                maxLength={30}
              />
              <TextArea
                label={t("checkout.address")}
                name="address"
                required
                minLength={3}
                maxLength={500}
                placeholder={t("checkout.addressPlaceholder")}
                autoComplete="street-address"
                className="[&_textarea]:min-h-20"
              />
              <TextArea label={t("checkout.notes")} name="notes" maxLength={2000} placeholder={t("checkout.notesPlaceholder")} className="[&_textarea]:min-h-20" />

              {state === "error" && <p className="rounded-xl bg-accent-soft p-3 text-sm text-accent-deep">{error}</p>}

              <button
                type="submit"
                disabled={state === "sending"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-4 font-display text-lg font-bold text-white transition hover:brightness-95 disabled:opacity-70"
              >
                {state === "sending" ? <Loader2 className="size-5 animate-spin" /> : <MessageCircle className="size-5" />}
                {state === "sending" ? t("form.sending") : t("checkout.submit")}
              </button>
              <p className="text-center text-sm text-muted">{t("checkout.payNote")}</p>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
                <Lock className="size-3.5" /> {t("checkout.trust")}
              </p>
            </form>

            {/* summary */}
            <aside className="order-1 space-y-4 lg:sticky lg:top-28 lg:order-2">
              <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 shadow-[0_30px_60px_-30px_rgb(var(--shadow-rgb)/.5)]">
                <div className="flex items-center justify-between bg-ink px-5 py-4 text-paper">
                  <h2 className="font-display font-black">{t("checkout.summaryTitle")}</h2>
                  <span className="rounded-full bg-paper/15 px-2.5 py-0.5 font-mono text-xs">{items.length}</span>
                </div>
                <ul className="divide-y divide-dashed divide-line px-5">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 py-3">
                      <span className="rounded-md bg-ink px-2 py-1 font-mono text-[11px] text-flap-amber">{it.code}</span>
                      <Link to={`/ideas/${it.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-accent-deep">
                        {it.title}
                      </Link>
                      <span className="shrink-0 font-display font-bold">{money(it.price)}</span>
                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-accent-soft hover:text-accent-deep"
                        aria-label={`${t("cart.remove")} ${it.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline justify-between border-t-2 border-ink px-5 py-4">
                  <span className="font-semibold">{t("cart.total")}</span>
                  <span className="font-display text-3xl font-black text-accent-deep">{money(total)}</span>
                </div>
                <Link to="/ideas" className="block border-t border-line py-3 text-center text-sm font-semibold text-slate hover:bg-paper">
                  + {t("cart.continue")}
                </Link>
              </div>

              <div className="rounded-3xl bg-accent-soft/60 p-5 ring-1 ring-accent/20">
                <p className="mb-3 font-display font-bold">{t("checkout.stepsTitle")}</p>
                <ol className="space-y-2.5">
                  {tl("checkout.steps").map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent font-mono text-xs font-semibold text-paper">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
