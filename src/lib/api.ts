/**
 * Single data-access layer for the whole app.
 * Today it reads mock data from src/data; when Supabase is connected,
 * only this file needs to change.
 */
import { ideas } from "../data/ideas";
import { workshops } from "../data/workshops";
import { instagramPosts } from "../data/instagram";
import { site } from "../data/site";
import type { Idea, IdeaOrder, InstagramPost, NewIdeaOrder, SiteInfo, Workshop } from "../types";

/** Simulates network latency so loading states are exercised. */
const delay = <T,>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

export function getSiteInfo(): Promise<SiteInfo> {
  return delay(site, 0);
}

export function getInstagramPosts(): Promise<InstagramPost[]> {
  return delay(instagramPosts);
}

export function getIdeas(): Promise<Idea[]> {
  return delay(ideas);
}

export function getFeaturedIdeas(): Promise<Idea[]> {
  return delay(ideas.filter((i) => i.featured));
}

export function getIdea(id: string): Promise<Idea | undefined> {
  return delay(ideas.find((i) => i.id === id));
}

export function getWorkshops(): Promise<Workshop[]> {
  return delay([...workshops].sort((a, b) => a.date.localeCompare(b.date)));
}

export function getUpcomingWorkshops(limit = 3): Promise<Workshop[]> {
  const now = new Date().toISOString();
  return delay(
    [...workshops]
      .filter((w) => w.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit),
  );
}

export function getWorkshop(id: string): Promise<Workshop | undefined> {
  return delay(workshops.find((w) => w.id === id));
}

/* ───────── Submissions (mock: kept in localStorage so the admin page can read them) ───────── */

function readStore<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage unavailable — ignore in mock mode */
  }
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

const ORDERS_KEY = "hura.orders";

export function createIdeaOrder(input: NewIdeaOrder): Promise<IdeaOrder> {
  const order: IdeaOrder = { ...input, id: newId(), createdAt: new Date().toISOString(), status: "جديد" };
  writeStore(ORDERS_KEY, [order, ...readStore<IdeaOrder>(ORDERS_KEY)]);
  return delay(order, 600);
}

export function getIdeaOrders(): Promise<IdeaOrder[]> {
  return delay(readStore<IdeaOrder>(ORDERS_KEY));
}
