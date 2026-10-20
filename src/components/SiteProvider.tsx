import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteInfo } from "../types";
import { getSiteInfo } from "../lib/api";
import { defaultSite } from "../data/site";

interface Ctx {
  site: SiteInfo;
  loaded: boolean;
  reload: () => void;
}

const SiteContext = createContext<Ctx>({ site: defaultSite, loaded: false, reload: () => {} });

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

  return <SiteContext.Provider value={{ site, loaded, reload }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
