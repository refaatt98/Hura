import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Idea } from "../types";

interface Ctx {
  items: CartItem[];
  count: number;
  total: number;
  has: (id: string) => boolean;
  add: (idea: Idea) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Cart drawer open state */
  open: boolean;
  setOpen: (v: boolean) => void;
}

const KEY = "hura.cart";
const CartContext = createContext<Ctx | null>(null);

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === "string") : [];
  } catch {
    return [];
  }
}

/** Shopping cart for idea files, remembered in this browser. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage blocked — cart just won't persist */
    }
  }, [items]);

  const add = useCallback((idea: Idea) => {
    setItems((xs) => (xs.some((x) => x.id === idea.id) ? xs : [...xs, { id: idea.id, code: idea.code, title: idea.title, price: idea.price }]));
  }, []);
  const remove = useCallback((id: string) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.length,
      total: items.reduce((s, x) => s + x.price, 0),
      has: (id) => items.some((x) => x.id === id),
      add,
      remove,
      clear,
      open,
      setOpen,
    }),
    [items, add, remove, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
