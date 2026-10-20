import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpLeft, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "./navLinks";
import Instagram from "./InstagramIcon";
import { useSite } from "./SiteProvider";

/** Floating pill navigation. */
export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { site, t } = useSite();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full bg-card/85 py-2 pr-4 pl-2 shadow-[0_8px_30px_-12px_rgb(var(--shadow-rgb)/.35)] ring-1 ring-ink/10 backdrop-blur-xl">
        <Logo />

        <nav className="hidden items-center lg:flex" aria-label="التنقل الرئيسي">
          {navLinks.slice(1).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive ? "text-paper" : "text-ink-soft hover:text-ink"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{t(l.key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/custom"
            className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-display text-sm font-bold text-paper transition-colors hover:bg-accent-deep sm:inline-flex"
          >
            {t("header.cta")} <ArrowUpLeft className="size-4" />
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full bg-ink text-paper lg:hidden"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ clipPath: "circle(0% at 5% 0%)" }}
            animate={{ clipPath: "circle(150% at 5% 0%)" }}
            exit={{ clipPath: "circle(0% at 5% 0%)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid-lines pointer-events-auto fixed inset-0 -z-10 flex flex-col bg-ink px-6 pt-28 pb-8 text-paper lg:hidden"
            aria-label="التنقل على الموبايل"
          >
            {navLinks.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `flex items-baseline justify-between border-b border-paper/10 py-4 font-display text-4xl font-extrabold ${isActive ? "text-accent" : "text-paper"}`
                  }
                >
                  {t(l.key)}
                  <span className="font-mono text-xs text-paper/40">0{i + 1}</span>
                </NavLink>
              </motion.div>
            ))}
            <div className="mt-auto flex items-center justify-between gap-3">
              <NavLink to="/custom" className="flex-1 rounded-full bg-accent py-4 text-center font-display font-bold">
                {t("header.mobileCta")}
              </NavLink>
              <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="grid size-14 place-items-center rounded-full ring-1 ring-paper/30" aria-label="إنستغرام">
                <Instagram className="size-5" />
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
