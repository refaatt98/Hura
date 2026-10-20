import type { CustomFormConfig, SiteInfo } from "../types";

export const defaultCustomForm: CustomFormConfig = {
  fieldQuestion: "بأي مجال حابب تشتغل؟",
  fields: ["أكل ومشروبات", "تجارة إلكترونية", "خدمات", "تعليم وتدريب", "تجميل وموضة", "صناعة وحِرف", "تقنية", "مش متأكد"],
  ideaQuestion: "عندك فكرة مبدئية؟ احكيلنا عنها",
  budgetQuestion: "قديش الميزانية المتوفرة؟",
  budgets: ["أقل من 10,000 ₪", "بين 10,000 و 35,000 ₪", "بين 35,000 و 100,000 ₪", "أكثر من 100,000 ₪"],
  timelineQuestion: "إمتى ناوي تبدأ؟",
  timelines: ["خلال شهر", "من 1 إلى 3 أشهر", "من 3 إلى 6 أشهر", "لسا بستكشف"],
  contactQuestion: "كيف بتحب نتواصل معك؟",
  contactWays: ["واتساب", "اتصال"],
  steps: [],
  note: "",
};

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
  customForm: defaultCustomForm,
  texts: {},
};
