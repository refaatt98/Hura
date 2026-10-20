import Instagram from "./InstagramIcon";

import type { InstagramPost } from "../types";

/** Instagram post displayed like a product on a shelf. */
export default function InstagramCard({ post, index }: { post: InstagramPost; index: number }) {
  return (
    <a href={post.url} target="_blank" rel="noreferrer" className="group block">
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-card p-2 transition-shadow duration-300 group-hover:shadow-[6px_6px_0_var(--color-accent)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 right-3 rounded-full bg-paper/95 px-2.5 py-1 font-mono text-[11px] text-ink">
            No. {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug">{post.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{post.caption}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-paper">
          <Instagram className="size-4" />
        </span>
      </div>
    </a>
  );
}
