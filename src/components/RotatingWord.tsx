import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Cycles through words with a flip-up animation. */
export default function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <span className={`relative -my-[0.15em] inline-grid overflow-hidden py-[0.15em] align-bottom ${className}`}>
      {/* reserve width for the longest word */}
      {words.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1">{w}</span>
      ))}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="col-start-1 row-start-1"
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
