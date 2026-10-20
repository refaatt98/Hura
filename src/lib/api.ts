/**
 * Single data-access layer for the whole app — everything goes through Supabase.
 * Pages and components only call these functions; they never talk to Supabase directly.
 *
 * Database columns are snake_case; the app's types (src/types.ts) are camelCase.
 * The `to*` / `from*` helpers below translate between the two.
 */
import { supabase } from "./supabase";
import { instagramPosts } from "../data/instagram";
import { site } from "../data/site";
import type {
  ContactMessage,
  CustomRequest,
  Difficulty,
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
  WorkshopMode,
  WorkshopRegistration,
} from "../types";

/* ───────── helpers ───────── */

type Row = Record<string, unknown>;

/** Turns a Supabase error into a readable Arabic message. */
function fail(error: { message: string; code?: string } | null): never {
  const msg = error?.message ?? "";
  // errors raised by our SQL functions are already in Arabic
  if (/[؀-ۿ]/.test(msg)) throw new Error(msg);
  throw new Error("صار خطأ بالاتصال، جرّب مرة ثانية.");
}

/** Empty strings become null in the database. */
const clean = (s?: string) => (s && s.trim() ? s.trim() : null);

/* ───────── site content (static for now) ───────── */

export async function getSiteInfo(): Promise<SiteInfo> {
  return site;
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  return instagramPosts;
}

/* ───────── ideas ───────── */

const toIdea = (r: Row): Idea => ({
  id: r.id as string,
  code: r.code as string,
  title: r.title as string,
  category: r.category as string,
  summary: r.summary as string,
  description: r.description as string,
  price: r.price as number,
  capitalMin: r.capital_min as number,
  capitalMax: r.capital_max as number,
  paybackMonths: r.payback_months as number,
  marginPercent: r.margin_percent as number,
  difficulty: r.difficulty as Difficulty,
  includes: (r.includes as string[]) ?? [],
  featured: r.featured as boolean,
});

const fromIdea = (i: Idea) => ({
  id: i.id,
  code: i.code,
  title: i.title,
  category: i.category,
  summary: i.summary,
  description: i.description,
  price: i.price,
  capital_min: i.capitalMin,
  capital_max: i.capitalMax,
  payback_months: i.paybackMonths,
  margin_percent: i.marginPercent,
  difficulty: i.difficulty,
  includes: i.includes,
  featured: i.featured,
});

export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase.from("ideas").select("*").order("featured", { ascending: false }).order("created_at");
  if (error) fail(error);
  return data.map(toIdea);
}

export async function getFeaturedIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase.from("ideas").select("*").eq("featured", true).order("created_at");
  if (error) fail(error);
  return data.map(toIdea);
}

export async function getIdea(id: string): Promise<Idea | undefined> {
  const { data, error } = await supabase.from("ideas").select("*").eq("id", id).maybeSingle();
  if (error) fail(error);
  return data ? toIdea(data) : undefined;
}

/** Create or update an idea (admin only — enforced by the database). */
export async function saveIdea(idea: Idea): Promise<Idea> {
  const { data, error } = await supabase.from("ideas").upsert(fromIdea(idea)).select().single();
  if (error) fail(error);
  return toIdea(data);
}

export async function deleteIdea(id: string): Promise<void> {
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) fail(error);
}

/* ───────── workshops ───────── */

/** Postgres `timestamp` comes back as "2026-11-14T10:00:00" (local event time). */
const toWorkshop = (r: Row): Workshop => ({
  id: r.id as string,
  title: r.title as string,
  summary: r.summary as string,
  description: r.description as string,
  date: String(r.date).slice(0, 19),
  durationHours: r.duration_hours as number,
  mode: r.mode as WorkshopMode,
  location: r.location as string,
  price: r.price as number,
  seats: r.seats as number,
  seatsTaken: r.seats_taken as number,
  trainer: r.trainer as string,
  agenda: (r.agenda as string[]) ?? [],
});

const fromWorkshop = (w: Workshop) => ({
  id: w.id,
  title: w.title,
  summary: w.summary,
  description: w.description,
  date: w.date,
  duration_hours: w.durationHours,
  mode: w.mode,
  location: w.location,
  price: w.price,
  seats: w.seats,
  seats_taken: w.seatsTaken,
  trainer: w.trainer,
  agenda: w.agenda,
});

/** Current local time in the same format as workshop dates. */
const nowLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
};

export async function getWorkshops(): Promise<Workshop[]> {
  const { data, error } = await supabase.from("workshops").select("*").order("date");
  if (error) fail(error);
  return data.map(toWorkshop);
}

export async function getUpcomingWorkshops(limit = 3): Promise<Workshop[]> {
  const { data, error } = await supabase.from("workshops").select("*").gte("date", nowLocal()).order("date").limit(limit);
  if (error) fail(error);
  return data.map(toWorkshop);
}

export async function getWorkshop(id: string): Promise<Workshop | undefined> {
  const { data, error } = await supabase.from("workshops").select("*").eq("id", id).maybeSingle();
  if (error) fail(error);
  return data ? toWorkshop(data) : undefined;
}

/** Create or update a workshop (admin only). */
export async function saveWorkshop(workshop: Workshop): Promise<Workshop> {
  const { data, error } = await supabase.from("workshops").upsert(fromWorkshop(workshop)).select().single();
  if (error) fail(error);
  return toWorkshop(data);
}

export async function deleteWorkshop(id: string): Promise<void> {
  const { error } = await supabase.from("workshops").delete().eq("id", id);
  if (error) fail(error);
}

/* ───────── public submissions ─────────
   Visitors can insert but not read back (RLS), so we don't `.select()` after insert. */

export async function createIdeaOrder(input: NewIdeaOrder): Promise<void> {
  const { error } = await supabase.from("idea_orders").insert({
    idea_id: input.ideaId,
    idea_title: input.ideaTitle,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: clean(input.email),
    notes: clean(input.notes),
  });
  if (error) fail(error);
}

export async function createCustomRequest(input: NewCustomRequest): Promise<void> {
  const { error } = await supabase.from("custom_requests").insert({
    field: input.field,
    idea: clean(input.idea),
    budget: input.budget,
    city: input.city.trim(),
    timeline: input.timeline,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: clean(input.email),
    contact_via: input.contactVia,
  });
  if (error) fail(error);
}

/** Books seats atomically in the database (checks availability). */
export async function createWorkshopRegistration(input: NewWorkshopRegistration): Promise<void> {
  const { error } = await supabase.rpc("register_for_workshop", {
    p_workshop_id: input.workshopId,
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email ?? null,
    p_notes: input.notes ?? null,
    p_seats: input.seats,
  });
  if (error) fail(error);
}

export async function createContactMessage(input: NewContactMessage): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name.trim(),
    contact: input.contact.trim(),
    subject: input.subject,
    message: input.message.trim(),
  });
  if (error) fail(error);
}

/* ───────── admin: submissions ───────── */

export interface SubmissionMap {
  orders: IdeaOrder;
  custom: CustomRequest;
  registrations: WorkshopRegistration;
  messages: ContactMessage;
}

const tables: Record<SubmissionKind, string> = {
  orders: "idea_orders",
  custom: "custom_requests",
  registrations: "workshop_registrations",
  messages: "contact_messages",
};

const base = (r: Row) => ({
  id: r.id as string,
  createdAt: r.created_at as string,
  status: r.status as RequestStatus,
});
const opt = (v: unknown) => (v == null ? undefined : (v as string));

const mappers: { [K in SubmissionKind]: (r: Row) => SubmissionMap[K] } = {
  orders: (r) => ({
    ...base(r),
    ideaId: (r.idea_id as string) ?? "",
    ideaTitle: r.idea_title as string,
    name: r.name as string,
    phone: r.phone as string,
    email: opt(r.email),
    notes: opt(r.notes),
  }),
  custom: (r) => ({
    ...base(r),
    field: r.field as string,
    idea: (r.idea as string) ?? "",
    budget: r.budget as string,
    city: r.city as string,
    timeline: r.timeline as string,
    name: r.name as string,
    phone: r.phone as string,
    email: opt(r.email),
    contactVia: r.contact_via as string,
  }),
  registrations: (r) => ({
    ...base(r),
    workshopId: (r.workshop_id as string) ?? "",
    workshopTitle: r.workshop_title as string,
    name: r.name as string,
    phone: r.phone as string,
    email: opt(r.email),
    seats: r.seats as number,
    notes: opt(r.notes),
  }),
  messages: (r) => ({
    ...base(r),
    name: r.name as string,
    contact: r.contact as string,
    subject: r.subject as string,
    message: r.message as string,
  }),
};

export async function getSubmissions<K extends SubmissionKind>(kind: K): Promise<SubmissionMap[K][]> {
  const { data, error } = await supabase.from(tables[kind]).select("*").order("created_at", { ascending: false });
  if (error) fail(error);
  return (data as Row[]).map(mappers[kind]);
}

export async function updateSubmissionStatus(kind: SubmissionKind, id: string, status: RequestStatus): Promise<void> {
  const { error } = await supabase.from(tables[kind]).update({ status }).eq("id", id);
  if (error) fail(error);
}

export async function deleteSubmission(kind: SubmissionKind, id: string): Promise<void> {
  const { error } = await supabase.from(tables[kind]).delete().eq("id", id);
  if (error) fail(error);
}
