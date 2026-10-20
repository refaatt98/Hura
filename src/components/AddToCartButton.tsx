import { useNavigate } from "react-router";
import { Check, ShoppingBag } from "lucide-react";
import type { Idea } from "../types";
import { useCart } from "./CartProvider";
import { useSite } from "./SiteProvider";

/** Adds the idea to the cart and opens the cart; if it's already there, goes to checkout. */
export default function AddToCartButton({ idea, className = "" }: { idea: Idea; className?: string }) {
  const { has, add, setOpen } = useCart();
  const { t } = useSite();
  const nav = useNavigate();
  const inCart = has(idea.id);

  return (
    <button
      type="button"
      onClick={() => {
        if (inCart) nav("/cart");
        else {
          add(idea);
          setOpen(true);
        }
      }}
      className={`flex items-center justify-center gap-2 rounded-full font-display font-bold transition-all active:scale-[0.98] ${
        inCart ? "bg-ink text-paper hover:bg-ink-2" : "bg-accent text-paper hover:bg-accent-deep"
      } ${className}`}
    >
      {inCart ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
      {inCart ? t("idea.inCart") : t("idea.buyButton")}
    </button>
  );
}
