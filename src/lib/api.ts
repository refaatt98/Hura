/**
 * Single data-access layer for the whole app — everything goes through Supabase.
 * Pages and components only call these functions; they never talk to Supabase directly.
 *
 * Database columns are snake_case; the app's types (src/types.ts) are camelCase.
 * The `to*` / `from*` helpers below translate between the two.
 */
import { supabase } from "./supabase";
import { defaultCustomForm, defaultSite } from "../data/site";
import { defaultTexts } from "../data/texts";
import type {
  CartItem,
  ContactMessage,
  CustomFormConfig,
  CustomRequest,
  Difficulty,
  Faq,
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

/* ───────── site settings ───────── */

const igUrl = (handle: string) => (handle ? `https://www.instagram.com/${handle.replace(/^@/, "")}/` : "");

export async function getSiteInfo(): Promise<SiteInfo> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) fail(error);
  if (!data) return defaultSite;
  const handle = String(data.instagram_handle ?? "").replace(/^@/, "");
  return {
    name: data.name,
    tagline: data.tagline,
    about: data.about,
    instagramHandle: handle,
    instagramUrl: igUrl(handle),
    whatsapp: data.whatsapp,
    email: data.email,
    city: data.city,
    heroBadge: data.hero_badge,
    heroTitle: data.hero_title,
    heroPrefix: data.hero_prefix,
    heroWords: data.hero_words ?? [],
    faqs: (data.faqs as Faq[]) ?? [],
    customForm: { ...defaultCustomForm, ...((data.custom_form as Partial<CustomFormConfig>) ?? {}) },
    texts: (data.texts as Record<string, string>) ?? {},
  };
}

const list = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);

export async function saveSiteInfo(s: SiteInfo): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .update({
      name: s.name,
      tagline: s.tagline,
      about: s.about,
      instagram_handle: s.instagramHandle.replace(/^@/, "").trim(),
      whatsapp: s.whatsapp.trim(),
      email: s.email.trim(),
      city: s.city.trim(),
      hero_badge: s.heroBadge,
      hero_title: s.heroTitle,
      hero_prefix: s.heroPrefix,
      hero_words: s.heroWords.filter(Boolean),
      faqs: s.faqs.filter((f) => f.q.trim() && f.a.trim()),
      // store only texts that differ from the built-in defaults
      texts: Object.fromEntries(Object.entries(s.texts).filter(([k, v]) => v !== defaultTexts[k])),
      custom_form: {
        ...s.customForm,
        fields: list(s.customForm.fields),
        budgets: list(s.customForm.budgets),
        timelines: list(s.customForm.timelines),
        contactWays: list(s.customForm.contactWays),
        steps: s.customForm.steps.filter((x) => x.t.trim()),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) fail(error);
}

/* ───────── Instagram posts ───────── */

const toPost = (r: Row): InstagramPost => ({
  id: r.id as string,
  image: r.image as string,
  title: r.title as string,
  caption: r.caption as string,
  url: r.url as string,
  sort: r.sort as number,
});

export async function getInstagramPosts(limit?: number): Promise<InstagramPost[]> {
  let q = supabase.from("instagram_posts").select("*").order("sort").order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) fail(error);
  return data.map(toPost);
}

/** Create (no id) or update an Instagram post. */
export async function saveInstagramPost(p: Omit<InstagramPost, "id"> & { id?: string }): Promise<void> {
  const row = { image: p.image, title: p.title, caption: p.caption, url: p.url, sort: p.sort };
  const { error } = p.id
    ? await supabase.from("instagram_posts").update(row).eq("id", p.id)
    : await supabase.from("instagram_posts").insert(row);
  if (error) fail(error);
}

export async function deleteInstagramPost(id: string): Promise<void> {
  const { error } = await supabase.from("instagram_posts").delete().eq("id", id);
  if (error) fail(error);
}

/* ───────── file uploads (Cloudflare R2) ─────────
   1. The "r2-upload" Edge Function returns a short-lived presigned URL
      (the R2 keys stay on the server, in Supabase Vault).
   2. The browser PUTs the file straight to R2 and we keep its public URL. */

const MAX_UPLOAD_MB = 500;

/** Uploads an image or video to Cloudflare R2 and returns its public URL. */
export async function uploadMedia(file: File, onProgress?: (percent: number) => void): Promise<string> {
  if (!/^(image|video)\//.test(file.type)) throw new Error("الملف لازم يكون صورة أو فيديو.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`الملف أكبر من ${MAX_UPLOAD_MB}MB.`);

  const { data, error } = await supabase.functions.invoke<{ uploadUrl: string; publicUrl: string; error?: string }>("r2-upload", {
    body: { name: file.name, type: file.type, size: file.size },
  });
  if (error || !data?.uploadUrl) {
    let msg = "ما قدرنا نجهّز الرفع، جرّب مرة ثانية.";
    try {
      const ctx = (error as { context?: Response } | null)?.context;
      const j = ctx ? await ctx.json() : null;
      if (j?.error) msg = j.error;
    } catch {
      /* keep default message */
    }
    throw new Error(msg);
  }

  // XMLHttpRequest (not fetch) so we can report upload progress for big videos
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("فشل الرفع، جرّب مرة ثانية.")));
    xhr.onerror = () => reject(new Error("انقطع الاتصال أثناء الرفع."));
    xhr.send(file);
  });
  onProgress?.(100);
  return data.publicUrl;
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

/** Short readable order number, e.g. HB-7K3Q9A (no ambiguous characters). */
export function newOrderCode(): string {
  const abc = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "HB-" + Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

/** Saves a cart order (several ideas). */
export async function createIdeaOrder(input: NewIdeaOrder): Promise<void> {
  const { error } = await supabase.from("idea_orders").insert({
    code: input.code,
    items: input.items,
    total: input.total,
    idea_id: input.items[0]?.id ?? null,
    idea_title: input.items.map((i) => i.title).join("، ").slice(0, 200),
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
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
  orders: (r) => {
    const items = (r.items as CartItem[] | null) ?? [];
    return {
      ...base(r),
      code: (r.code as string) ?? "",
      // older single-idea orders: fall back to the idea title
      items: items.length ? items : [{ id: (r.idea_id as string) ?? "", code: "", title: (r.idea_title as string) ?? "", price: 0 }],
      total: (r.total as number) ?? 0,
      name: r.name as string,
      phone: r.phone as string,
      address: (r.address as string) ?? "",
      notes: opt(r.notes),
    };
  },
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
