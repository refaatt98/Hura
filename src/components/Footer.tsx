import { Link } from "react-router";
import { ArrowUpLeft, Mail, MessageCircle } from "lucide-react";
import Instagram from "./InstagramIcon";
import Container from "./Container";
import { navLinks } from "./navLinks";
import { site } from "../data/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="grid-lines relative mt-28 overflow-hidden bg-ink text-paper">
      <Container className="grid gap-12 pt-20 pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="max-w-sm font-display text-3xl leading-tight font-extrabold sm:text-4xl">
            جاهز تكتب أول سطر <span className="text-accent">بمشروعك؟</span>
          </p>
          <Link
            to="/custom"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display text-sm font-bold transition-colors hover:bg-accent-deep"
          >
            ابدأ هلأ <ArrowUpLeft className="size-4" />
          </Link>
        </div>

        <div>
          <h3 className="mb-4 font-mono text-xs text-paper/40">/ الصفحات</h3>
          <ul className="space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-paper/85 transition-colors hover:text-accent">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-mono text-xs text-paper/40">/ تواصل</h3>
          <ul className="space-y-3 text-paper/85">
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                <Instagram className="size-4" /> <span dir="ltr">@{site.instagramHandle}</span>
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4" />
              {site.whatsapp ? <span dir="ltr">{site.whatsapp}</span> : <span className="text-paper/40">واتساب — يُضاف لاحقاً</span>}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              {site.email ? <span dir="ltr">{site.email}</span> : <span className="text-paper/40">الإيميل — يُضاف لاحقاً</span>}
            </li>
          </ul>
        </div>
      </Container>

      {/* giant wordmark */}
      <div aria-hidden dir="ltr" className="pointer-events-none -mb-[4.5vw] text-center font-display text-[27vw] leading-[0.8] font-black tracking-tighter text-paper/[0.06] select-none">
        hura
      </div>

      <div className="relative border-t border-paper/10">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-paper/45">
          <span>© {year} Hura Business — Hura Projects</span>
          <Link to="/admin" className="hover:text-paper">لوحة الإدارة</Link>
        </Container>
      </div>
    </footer>
  );
}
