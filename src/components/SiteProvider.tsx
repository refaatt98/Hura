import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteInfo } from "../types";
import { getSiteInfo } from "../lib/api";
import { defaultSite } from "../data/site";
import { defaultTexts } from "../data/texts";

interface Ctx {
  site: SiteInfo;
  loaded: boolean;
  reload: () => void;
  /** Editable text by key (see src/data/texts.ts). `{name}`-style placeholders are filled from `vars`. */
  t: (key: string, vars?: Record<string, string>) => string;
  /** Same as t() but split into one item per non-empty line. */
  tl: (key: string) => string[];
}

const fill = (s: string, vars?: Record<string, string>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m)) : s;

const SiteContext = createContext<Ctx>({
  site: defaultSite,
  loaded: false,
  reload: () => {},
  t: (k, v) => fill(defaultTexts[k] ?? k, v),
  tl: (k) => (defaultTexts[k] ?? "").split("\n").map((x) => x.trim()).filter(Boolean),
});

/** Loads the editable site settings once and shares them with every page. */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteInfo>(defaultSite);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    getSiteInfo()
      .then(setSite)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => fill(site.texts[key] ?? defaultTexts[key] ?? key, vars),
    [site.texts],
  );
  const tl = useCallback((key: string) => t(key).split("\n").map((x) => x.trim()).filter(Boolean), [t]);

  return <SiteContext.Provider value={{ site, loaded, reload, t, tl }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

/** Renders `text`, wrapping the first occurrence of `hl` in a highlighted span. */
export function Hl({ text, hl, className = "text-accent" }: { text: string; hl?: string; className?: string }) {
  if (!hl || !text.includes(hl)) return <>{text}</>;
  const i = text.indexOf(hl);
  return (
    <>
      {text.slice(0, i)}
      <span className={className}>{hl}</span>
      {text.slice(i + hl.length)}
    </>
  );
}
