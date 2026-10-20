import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import ButtonLink from "./ButtonLink";
import { navLinks } from "./navLinks";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-paper/90 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink to="/custom" variant="ink" className="py-2.5">
            اطلب مشروعك
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg border-2 border-ink lg:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line bg-paper lg:hidden"
            aria-label="التنقل على الموبايل"
          >
            <Container className="flex h-[calc(100dvh-4rem)] flex-col py-6">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center justify-between border-b border-dashed border-line py-4 font-display text-2xl font-semibold ${
                        isActive ? "text-accent" : "text-ink"
                      }`
                    }
                  >
                    {l.label}
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </NavLink>
                </motion.div>
              ))}
              <ButtonLink to="/custom" variant="primary" className="mt-8 py-4 text-base">
                اطلب مشروعك المخصص
              </ButtonLink>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
