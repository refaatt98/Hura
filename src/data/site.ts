import type { SiteInfo } from "../types";

/**
 * Fallback content shown for a split second before the real settings load
 * from the database (edit the real ones from /admin → إعدادات الموقع).
 */
export const defaultSite: SiteInfo = {
  name: "Hura Business",
  tagline: "أفكار مشاريع مدروسة، وطريق واضح للبداية",
  about: "",
  instagramHandle: "hura_business_projects",
  instagramUrl: "https://www.instagram.com/hura_business_projects/",
  whatsapp: "",
  email: "",
  city: "",
  heroBadge: "Hura Business · Hura Projects",
  heroTitle: "لا تبدأ من الصفر.",
  heroPrefix: "ابدأ من",
  heroWords: ["فرصة مدروسة", "خطة واضحة", "أرقام حقيقية"],
  faqs: [],
};
