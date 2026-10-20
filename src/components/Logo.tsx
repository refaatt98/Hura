import { Link } from "react-router";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2" aria-label="Hura Business — الرئيسية">
      <span className={`relative grid size-9 place-items-center rounded-full ${light ? "bg-paper text-ink" : "bg-ink text-paper"}`}>
        <span className="font-display text-base font-black leading-none">H</span>
        <span className="absolute -top-0.5 -left-0.5 size-3 rounded-full bg-accent ring-2 ring-paper transition-transform group-hover:scale-125" />
      </span>
      <span dir="ltr" className={`font-display text-[17px] font-black tracking-tight ${light ? "text-paper" : "text-ink"}`}>
        hura<span className="text-accent">/</span>business
      </span>
    </Link>
  );
}
