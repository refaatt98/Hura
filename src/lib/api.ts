/**
 * Single data-access layer for the whole app.
 * Today it reads mock data from src/data; when Supabase is connected,
 * only this file needs to change.
 */
import { ideas } from "../data/ideas";
import { workshops } from "../data/workshops";
import { instagramPosts } from "../data/instagram";
import { site } from "../data/site";
import type { Idea, InstagramPost, SiteInfo, Workshop } from "../types";

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
