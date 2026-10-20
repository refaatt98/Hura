import { AnimatePresence, motion } from "motion/react";

/**
 * One split-flap cell (like an airport departures board).
 * The whole value flips at once, so Arabic letters stay joined.
 */
export function Flap({ value, className = "", delay = 0 }: { value: string; className?: string; delay?: number }) {
  return (
    <span className={`relative inline-grid overflow-hidden rounded-[5px] bg-flap px-2 py-1 text-flap-text [perspective:400px] ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="col-start-1 row-start-1 block origin-center truncate [backface-visibility:hidden]"
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.28, delay, ease: "easeOut" }}
        >
          {value === " " ? "\u00a0" : value}
        </motion.span>
      </AnimatePresence>
      {/* hinge line */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/[0.04]" />
    </span>
  );
}

/** Digits flip one by one (Latin characters only). */
export function FlapDigits({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span dir="ltr" className="inline-flex gap-[2px]">
      {value.split("").map((ch, i) => (
        <Flap key={i} value={ch} delay={i * 0.05} className={`w-[1.45em] justify-items-center px-0 font-mono ${className}`} />
      ))}
    </span>
  );
}
