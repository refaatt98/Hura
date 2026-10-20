# Hura Business — Frontend

موقع تعريفي لـ Hura Business / Hura Projects: أفكار مشاريع جاهزة، مشاريع مخصصة، وورشات تدريبية.

## التشغيل

```bash
npm install
npm run dev
```

بعدها افتح الرابط اللي بيطلع (عادة http://localhost:5173).

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل نسخة التطوير |
| `npm run build` | فحص TypeScript وبناء نسخة الإنتاج بمجلد `dist` |
| `npm run preview` | معاينة نسخة الإنتاج محلياً |

## الستاك
React + TypeScript · Vite · Tailwind CSS v4 · React Router · motion · lucide-react

## هيكل المشروع
```
src/
  pages/        صفحة لكل ملف
  components/   مكوّنات مشتركة
  data/         بيانات وهمية (لحد ما نربط Supabase)
  lib/api.ts    كل جلب للبيانات بيمر من هون
  types.ts      أنواع البيانات
  index.css     الألوان والخطوط (tokens) بمكان واحد
```

- **تغيير الألوان والخطوط:** من `@theme` بأول `src/index.css`.
- **صور إنستغرام:** بدّل الملفات بـ `public/instagram/` وعدّل `src/data/instagram.ts`.
- **معلومات التواصل والوصف:** `src/data/site.ts`.

## Supabase (لاحقاً)
كل الدوال بـ `src/lib/api.ts` بترجع `Promise`، فبس بنغيّر هالملف. المتغيرات المطلوبة موجودة بـ `.env.example`
(`VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`). **لا تحط أبداً Personal Access Token (`sbp_...`) أو `service_role` key بالفرونت إند.**

## النشر على Netlify
الإعدادات جاهزة بـ `netlify.toml` (أمر البناء، مجلد `dist`، وتوجيه كل الروابط لـ `index.html` عشان React Router).
اربط الـ repo من Netlify ← Add new site ← Import from Git، وما في داعي تغيّر إشي.
