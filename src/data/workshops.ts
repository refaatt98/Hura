import type { Workshop } from "../types";

export const workshops: Workshop[] = [
  {
    id: "from-idea-to-plan",
    title: "من الفكرة إلى الخطة",
    summary: "يوم عملي تخرج منه بخطة مشروع من صفحة واحدة وأرقام أولية واضحة.",
    description:
      "ورشة تطبيقية نشتغل فيها على فكرتك أنت: نحدد العميل، نحسب التكاليف، ونبني خطة إطلاق بسيطة قابلة للتنفيذ.",
    date: "2026-11-14T10:00:00",
    durationHours: 5,
    mode: "حضوري",
    location: "يُحدد لاحقاً",
    price: 35,
    seats: 20,
    seatsTaken: 13,
    trainer: "فريق Hura",
    agenda: ["اختبار الفكرة بسرعة", "حساب التكاليف ونقطة التعادل", "خطة أول 90 يوم", "عرض الخطط وتقييمها"],
  },
  {
    id: "pricing-that-profits",
    title: "تسعير يحقق ربح",
    summary: "كيف تسعّر منتجك أو خدمتك بدون ما تخسر أو تطفّش العميل.",
    description:
      "جلسة أونلاين مكثفة عن حساب التكلفة الحقيقية، وهامش الربح، والتسعير حسب السوق، مع أمثلة من مشاريع صغيرة حقيقية.",
    date: "2026-11-28T18:00:00",
    durationHours: 2,
    mode: "أونلاين",
    location: "Zoom",
    price: 15,
    seats: 60,
    seatsTaken: 22,
    trainer: "فريق Hura",
    agenda: ["التكلفة الحقيقية", "طرق التسعير الثلاث", "العروض والخصومات بذكاء"],
  },
  {
    id: "instagram-sales",
    title: "إنستغرام كقناة بيع",
    summary: "حوّل حسابك من معرض صور إلى مصدر طلبات ثابت.",
    description:
      "ورشة عن بناء محتوى يبيع، وتحويل المتابعين إلى عملاء، وإدارة الطلبات عبر الرسائل وواتساب.",
    date: "2026-12-12T17:00:00",
    durationHours: 3,
    mode: "أونلاين",
    location: "Zoom",
    price: 20,
    seats: 50,
    seatsTaken: 9,
    trainer: "فريق Hura",
    agenda: ["هوية الحساب", "محتوى يبيع", "من الرسالة إلى الطلب"],
  },
];
