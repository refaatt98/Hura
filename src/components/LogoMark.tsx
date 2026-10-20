/** The Hura "seed" mark: an H with a leaf growing from it (an idea growing into a project). */
export default function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="32" fill="var(--color-accent)" />
      <path
        d="M21 18 V48 M42 30 V48 M21 34 C27 30 35 30 42 34"
        stroke="var(--color-paper)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M42 30 C42 20 48 13 57 12 C57 21 51 28 42 30 Z" fill="var(--color-flap-amber)" />
      <path d="M42 30 C45 25 49 20 53 17" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
