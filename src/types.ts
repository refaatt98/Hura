export type Difficulty = "سهل" | "متوسط" | "متقدم";

export interface Idea {
  id: string;
  /** Short file code shown on the card, e.g. "F-014" */
  code: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  /** Price of the full idea file, in ILS (₪) */
  price: number;
  /** Estimated starting capital range, in ILS (₪) */
  capitalMin: number;
  capitalMax: number;
  /** Estimated months to recover the capital */
  paybackMonths: number;
  /** Estimated monthly profit margin, percent */
  marginPercent: number;
  difficulty: Difficulty;
  includes: string[];
  featured: boolean;
}

export type WorkshopMode = "حضوري" | "أونلاين";

export interface Workshop {
  id: string;
  title: string;
  summary: string;
  description: string;
  /** ISO date string */
  date: string;
  durationHours: number;
  mode: WorkshopMode;
  location: string;
  price: number;
  seats: number;
  seatsTaken: number;
  trainer: string;
  agenda: string[];
}

export interface InstagramPost {
  id: string;
  image: string;
  title: string;
  caption: string;
  url: string;
  sort: number;
}

export interface Faq {
  q: string;
  a: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  about: string;
  instagramHandle: string;
  /** Derived from instagramHandle */
  instagramUrl: string;
  whatsapp: string;
  email: string;
  city: string;
  heroBadge: string;
  heroTitle: string;
  heroPrefix: string;
  heroWords: string[];
  faqs: Faq[];
}

export type RequestStatus = "جديد" | "قيد المتابعة" | "مكتمل";

export interface IdeaOrder {
  id: string;
  ideaId: string;
  ideaTitle: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  status: RequestStatus;
}

export type NewIdeaOrder = Pick<IdeaOrder, "ideaId" | "ideaTitle" | "name" | "phone" | "email" | "notes">;

export interface CustomRequest {
  id: string;
  field: string;
  idea: string;
  budget: string;
  city: string;
  timeline: string;
  name: string;
  phone: string;
  email?: string;
  contactVia: string;
  createdAt: string;
  status: RequestStatus;
}

export type NewCustomRequest = Omit<CustomRequest, "id" | "createdAt" | "status">;

export interface WorkshopRegistration {
  id: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  phone: string;
  email?: string;
  seats: number;
  notes?: string;
  createdAt: string;
  status: RequestStatus;
}

export type NewWorkshopRegistration = Omit<WorkshopRegistration, "id" | "createdAt" | "status">;

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  createdAt: string;
  status: RequestStatus;
}

export type NewContactMessage = Omit<ContactMessage, "id" | "createdAt" | "status">;

/** Kinds of submissions the admin can manage. */
export type SubmissionKind = "orders" | "custom" | "registrations" | "messages";
