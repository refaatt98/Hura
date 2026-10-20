import { Link } from "react-router";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Hura Business — الرئيسية">
      <span
        className={`relative grid size-9 place-items-center rounded-lg ${light ? "bg-paper text-ink" : "bg-ink text-paper"}`}
      >
        <span className="font-display text-lg font-bold leading-none">H</span>
        <span className="absolute -top-1 -left-1 size-3 rounded-full bg-accent ring-2 ring-paper transition-transform group-hover:scale-125" />
      </span>
      <span dir="ltr" className={`font-display text-lg font-bold tracking-tight ${light ? "text-paper" : "text-ink"}`}>
        Hura<span className="text-accent">.</span>Business
      </span>
    </Link>
  );
}
