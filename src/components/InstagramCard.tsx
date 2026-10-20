import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Instagram from "./InstagramIcon";
import type { InstagramPost } from "../types";

/** Instagram post displayed like a product, with a subtle 3D tilt on hover. */
export default function InstagramCard({ post, index }: { post: InstagramPost; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  return (
    <motion.a
      href={post.url}
      target="_blank"
      rel="noreferrer"
      className="group block [perspective:900px]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative overflow-hidden rounded-3xl bg-ink shadow-[0_30px_60px_-30px_rgb(var(--shadow-rgb)/.6)]">
        <div className="aspect-[4/5]">
          <img src={post.image} alt={post.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <span className="absolute top-4 right-4 rounded-full bg-paper px-3 py-1 font-mono text-[11px] font-semibold text-ink">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-paper/90 p-3 backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1">
          <div className="min-w-0">
            <h3 className="truncate font-display font-bold">{post.title}</h3>
            <p className="truncate text-xs text-ink-soft">{post.caption}</p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-paper">
            <Instagram className="size-4" />
          </span>
        </div>
      </motion.div>
    </motion.a>
  );
}
