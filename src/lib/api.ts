/**
 * Single data-access layer for the whole app.
 *
 * MOCK MODE: seed data comes from src/data, and anything created or edited
 * (orders, registrations, messages, admin edits) is saved in the browser's
 * localStorage. That means it only lives on the device it was made on.
 *
 * When Supabase is connected, only this file needs to change — every
 * function keeps the same name and returns the same Promise type.
 */
import { ideas as seedIdeas } from "../data/ideas";
import { workshops as seedWorkshops } from "../data/workshops";
import { instagramPosts } from "../data/instagram";
import { site } from "../data/site";
import type {
  ContactMessage,
  CustomRequest,
  Idea,
  IdeaOrder,
  InstagramPost,
  NewContactMessage,
  NewCustomRequest,
  NewIdeaOrder,
  NewWorkshopRegistration,
  RequestStatus,
  SiteInfo,
  SubmissionKind,
  Workshop,
  WorkshopRegistration,
} from "../types";

/* ───────── helpers ───────── */

/** Simulates network latency so loading states are exercised. */
const delay = <T,>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

function readStore<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

function writeStore<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage unavailable — ignore in mock mode */
  }
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const KEYS = {
  ideas: "hura.ideas",
  workshops: "hura.workshops",
  orders: "hura.orders",
  custom: "hura.custom",
  registrations: "hura.registrations",
  messages: "hura.messages",
  session: "hura.session",
} as const;

const allIdeas = () => readStore<Idea>(KEYS.ideas) ?? seedIdeas;
const allWorkshops = () => readStore<Workshop>(KEYS.workshops) ?? seedWorkshops;

/* ───────── site content ───────── */

export function getSiteInfo(): Promise<SiteInfo> {
  return delay(site, 0);
}

export function getInstagramPosts(): Promise<InstagramPost[]> {
  return delay(instagramPosts);
}

/* ───────── ideas ───────── */

export function getIdeas(): Promise<Idea[]> {
  return delay(allIdeas());
}

export function getFeaturedIdeas(): Promise<Idea[]> {
  return delay(allIdeas().filter((i) => i.featured));
}

export function getIdea(id: string): Promise<Idea | undefined> {
  return delay(allIdeas().find((i) => i.id === id));
}

/** Create or update an idea (admin). */
export function saveIdea(idea: Idea): Promise<Idea> {
  const list = allIdeas();
  const idx = list.findIndex((i) => i.id === idea.id);
  const next = idx >= 0 ? list.map((i) => (i.id === idea.id ? idea : i)) : [idea, ...list];
  writeStore(KEYS.ideas, next);
  return delay(idea);
}

export function deleteIdea(id: string): Promise<void> {
  writeStore(KEYS.ideas, allIdeas().filter((i) => i.id !== id));
  return delay(undefined);
}

/* ───────── workshops ───────── */

const byDate = (a: Workshop, b: Workshop) => a.date.localeCompare(b.date);

export function getWorkshops(): Promise<Workshop[]> {
  return delay([...allWorkshops()].sort(byDate));
}

export function getUpcomingWorkshops(limit = 3): Promise<Workshop[]> {
  const now = new Date().toISOString();
  return delay([...allWorkshops()].filter((w) => w.date >= now).sort(byDate).slice(0, limit));
}

export function getWorkshop(id: string): Promise<Workshop | undefined> {
  return delay(allWorkshops().find((w) => w.id === id));
}

/** Create or update a workshop (admin). */
export function saveWorkshop(workshop: Workshop): Promise<Workshop> {
  const list = allWorkshops();
  const idx = list.findIndex((w) => w.id === workshop.id);
  const next = idx >= 0 ? list.map((w) => (w.id === workshop.id ? workshop : w)) : [workshop, ...list];
  writeStore(KEYS.workshops, next);
  return delay(workshop);
}

export function deleteWorkshop(id: string): Promise<void> {
  writeStore(KEYS.workshops, allWorkshops().filter((w) => w.id !== id));
  return delay(undefined);
}

/* ───────── public submissions ───────── */

function addSubmission<T>(key: string, item: T): Promise<T> {
  writeStore(key, [item, ...(readStore<T>(key) ?? [])]);
  return delay(item, 600);
}

const stamp = () => ({ id: newId(), createdAt: new Date().toISOString(), status: "جديد" as RequestStatus });

export function createIdeaOrder(input: NewIdeaOrder): Promise<IdeaOrder> {
  return addSubmission<IdeaOrder>(KEYS.orders, { ...input, ...stamp() });
}

export function createCustomRequest(input: NewCustomRequest): Promise<CustomRequest> {
  return addSubmission<CustomRequest>(KEYS.custom, { ...input, ...stamp() });
}

export async function createWorkshopRegistration(input: NewWorkshopRegistration): Promise<WorkshopRegistration> {
  const w = allWorkshops().find((x) => x.id === input.workshopId);
  if (!w) throw new Error("الورشة غير موجودة");
  if (w.seats - w.seatsTaken < input.seats) throw new Error("ما في مقاعد كافية");
  writeStore(
    KEYS.workshops,
    allWorkshops().map((x) => (x.id === w.id ? { ...x, seatsTaken: x.seatsTaken + input.seats } : x)),
  );
  return addSubmission<WorkshopRegistration>(KEYS.registrations, { ...input, ...stamp() });
}

export function createContactMessage(input: NewContactMessage): Promise<ContactMessage> {
  return addSubmission<ContactMessage>(KEYS.messages, { ...input, ...stamp() });
}

/* ───────── admin: submissions ───────── */

export interface SubmissionMap {
  orders: IdeaOrder;
  custom: CustomRequest;
  registrations: WorkshopRegistration;
  messages: ContactMessage;
}

export function getSubmissions<K extends SubmissionKind>(kind: K): Promise<SubmissionMap[K][]> {
  return delay(readStore<SubmissionMap[K]>(KEYS[kind]) ?? []);
}

export function getIdeaOrders(): Promise<IdeaOrder[]> {
  return getSubmissions("orders");
}

export function updateSubmissionStatus(kind: SubmissionKind, id: string, status: RequestStatus): Promise<void> {
  const list = readStore<{ id: string; status: RequestStatus }>(KEYS[kind]) ?? [];
  writeStore(KEYS[kind], list.map((x) => (x.id === id ? { ...x, status } : x)));
  return delay(undefined, 100);
}

export function deleteSubmission(kind: SubmissionKind, id: string): Promise<void> {
  const list = readStore<{ id: string }>(KEYS[kind]) ?? [];
  writeStore(KEYS[kind], list.filter((x) => x.id !== id));
  return delay(undefined, 100);
}

/* ───────── admin: auth (mock) ───────── */
// ⚠️ Front-end only check — NOT real security. Replace with Supabase Auth.
// Set VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD in Netlify to change the demo login.

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@hura.ps";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hura2026";

export function signIn(email: string, password: string): Promise<boolean> {
  const ok = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
  if (ok) {
    try {
      localStorage.setItem(KEYS.session, JSON.stringify({ email: ADMIN_EMAIL, at: Date.now() }));
    } catch {
      /* ignore */
    }
  }
  return delay(ok, 500);
}

export function signOut(): Promise<void> {
  try {
    localStorage.removeItem(KEYS.session);
  } catch {
    /* ignore */
  }
  return delay(undefined, 0);
}

export function isSignedIn(): boolean {
  try {
    return Boolean(localStorage.getItem(KEYS.session));
  } catch {
    return false;
  }
}
