import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { useSite } from "./SiteProvider";
import { money } from "../lib/format";

/** Slide-in cart panel, opened from the header. */
export default function CartDrawer() {
  const { items, total, remove, open, setOpen } = useCart();
  const { t } = useSite();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("cart.title")}
            className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-card shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between bg-ink px-5 py-4 text-paper">
              <h2 className="inline-flex items-center gap-2 text-lg font-black">
                <ShoppingBag className="size-5 text-flap-amber" /> {t("cart.title")}
                <span className="rounded-full bg-paper/15 px-2 py-0.5 font-mono text-xs">{items.length}</span>
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-paper/10" aria-label="إغلاق">
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <ShoppingBag className="mx-auto size-12 text-line" />
                  <p className="mt-4 font-display text-xl font-bold">{t("cart.empty")}</p>
                  <p className="mt-2 text-ink-soft">{t("cart.emptyText")}</p>
                  <Link to="/ideas" className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display text-sm font-bold text-paper">
                    {t("cart.browse")} <ArrowLeft className="size-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-2 overflow-y-auto p-4">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
                      <span className="rounded-md bg-ink px-2 py-1 font-mono text-[11px] text-flap-amber">{it.code}</span>
                      <Link to={`/ideas/${it.id}`} className="min-w-0 flex-1 truncate font-display font-bold hover:text-accent-deep">
                        {it.title}
                      </Link>
                      <span className="shrink-0 font-display font-bold">{money(it.price)}</span>
                      <button type="button" onClick={() => remove(it.id)} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-accent-soft hover:text-accent-deep" aria-label={`${t("cart.remove")} ${it.title}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-line p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-soft">{t("cart.total")}</span>
                    <span className="font-display text-3xl font-black">{money(total)}</span>
                  </div>
                  <Link to="/cart" className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 font-display font-bold text-paper hover:bg-accent-deep">
                    {t("cart.checkout")} <ArrowLeft className="size-4" />
                  </Link>
                  <Link to="/ideas" className="block text-center text-sm font-semibold text-slate hover:underline">
                    {t("cart.continue")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
