import { Link } from "react-router";
import LogoMark from "./LogoMark";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Hura Business — الرئيسية">
      <LogoMark className="size-10 shrink-0 transition-transform duration-300 group-hover:-rotate-12" />
      <span dir="ltr" className={`font-display leading-none ${light ? "text-paper" : "text-ink"}`}>
        <span className="block text-[21px] font-black tracking-tight">
          hura<span className={light ? "text-flap-amber" : "text-accent"}>.</span>
        </span>
        <span className="mt-0.5 block text-[8.5px] font-bold tracking-[0.3em] opacity-75">BUSINESS</span>
      </span>
    </Link>
  );
}
