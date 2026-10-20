import Instagram from "./InstagramIcon";
import { Link } from "react-router";
import { Mail, MessageCircle } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import { navLinks } from "./navLinks";
import { site } from "../data/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-paper">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">{site.tagline}.</p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-paper/25 px-4 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            <Instagram className="size-4" />
            <span dir="ltr">@{site.instagramHandle}</span>
          </a>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-paper/50">الصفحات</h3>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-paper/85 transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-paper/50">تواصل</h3>
          <ul className="space-y-3 text-sm text-paper/85">
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4 text-accent" />
              {site.whatsapp ? <span dir="ltr">{site.whatsapp}</span> : <span className="text-paper/50">واتساب — يُضاف لاحقاً</span>}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-accent" />
              {site.email ? <span dir="ltr">{site.email}</span> : <span className="text-paper/50">الإيميل — يُضاف لاحقاً</span>}
            </li>
            <li>
              <Link to="/contact" className="inline-block border-b border-accent pb-0.5 text-paper hover:text-accent">
                أرسل لنا رسالة
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-paper/10">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-paper/50">
          <span>© {year} Hura Business. جميع الحقوق محفوظة.</span>
          <Link to="/admin" className="hover:text-paper">لوحة الإدارة</Link>
        </Container>
      </div>
    </footer>
  );
}
