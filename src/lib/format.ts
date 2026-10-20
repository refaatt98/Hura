const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Currency symbol — Israeli new shekel */
export const CURRENCY = "₪";

export const money = (n: number) => `${num.format(n)}\u00a0${CURRENCY}`;

export const moneyRange = (min: number, max: number) =>
  `${num.format(min)}–${num.format(max)}\u00a0${CURRENCY}`;

const dateFmt = new Intl.DateTimeFormat("ar-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const dayFmt = new Intl.DateTimeFormat("ar-u-nu-latn", { day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("ar-u-nu-latn", { month: "short" });
const timeFmt = new Intl.DateTimeFormat("ar-u-nu-latn", { hour: "numeric", minute: "2-digit" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

const k = (n: number) => `${Number((n / 1000).toFixed(1))}k`;
/** Compact range, e.g. 15000–25000 → "15k–25k ₪" */
export const compactRange = (min: number, max: number) => `${k(min)}–${k(max)}\u00a0${CURRENCY}`;

export const hoursLabel = (n: number) =>
  n === 1 ? "ساعة" : n === 2 ? "ساعتان" : n <= 10 ? `${n} ساعات` : `${n} ساعة`;

export const monthsLabel = (n: number) =>
  n === 1 ? "شهر" : n === 2 ? "شهران" : n <= 10 ? `${n} أشهر` : `${n} شهر`;
