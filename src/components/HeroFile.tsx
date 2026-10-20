import { motion } from "motion/react";

/** Decorative stack of "opportunity file" sheets for the hero. */
export default function HeroFile() {
  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md" aria-hidden>
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: -6 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 rounded-2xl border-2 border-ink bg-paper-deep"
      />
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 3 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute inset-0 rounded-2xl border-2 border-ink bg-accent-soft"
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="ruled relative rounded-2xl border-2 border-ink bg-card p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-7"
      >
        <div className="flex items-center justify-between">
          <span className="file-label">ملف فرصة · F-014</span>
          <span className="size-3 rounded-full bg-accent" />
        </div>
        <h3 className="mt-6 text-2xl font-bold">عربة قهوة مختصة</h3>
        <p className="mt-2 text-sm text-ink-soft">قرب الجامعات والمكاتب — ساعات الذروة الصباحية.</p>

        <div className="mt-6 space-y-3">
          {[
            ["رأس المال", "4k–7k$", 55],
            ["الاسترداد", "8 أشهر", 40],
            ["هامش الربح", "55%", 72],
          ].map(([label, value, w], i) => (
            <div key={label as string}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span dir="auto" className="font-mono font-medium">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                <motion.div
                  className="h-full rounded-full bg-ink"
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 0.9, delay: 0.9 + i * 0.15, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-line pt-4 text-xs text-muted">
          <span>يشمل: الموردين · التسعير · خطة 30 يوم</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 1.5 }}
          className="absolute -top-5 -left-4 rounded-lg border-[3px] border-accent bg-card/90 px-3 py-1.5 font-display text-sm font-bold text-accent sm:-left-8"
        >
          فرصة مدروسة ✓
        </motion.div>
      </motion.div>
    </div>
  );
}
