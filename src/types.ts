export type Difficulty = "سهل" | "متوسط" | "متقدم";

export interface Idea {
  id: string;
  /** Short file code shown on the card, e.g. "F-014" */
  code: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  /** Price of the full idea file, in USD */
  price: number;
  /** Estimated starting capital range, in USD */
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
}

export interface SiteInfo {
  name: string;
  tagline: string;
  about: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsapp: string;
  email: string;
  city: string;
}
