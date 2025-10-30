# Netlify deploy (promohive)

الخطوات للتحقق محليًا وبناء نسخة جاهزة للنشر:

1) إعداد محلي
   - Node 18+
   - pnpm (مفضّل لأن الريبو يحتوي pnpm-lock.yaml)
     - تثبيت pnpm: `npm i -g pnpm`

2) بناء المشروع محليًا (للتحقق من السجلات وإنتاج dist)
```
cd promohive
pnpm install
pnpm run build
```
   - تأكد من وجود المجلد الناتج: `promohive/dist`
   - لتفحص المخرجات محليًا: `npx serve promohive/dist` أو `pnpm exec vite preview --port 4173`

3) إعداد Netlify (عبر الواجهة)
   - Branch to deploy: `tidy/netlify-deploy` (أو `main` بعد المراجعة)
   - Base directory: `promohive`
   - Build command: `pnpm install && pnpm run build`
   - Publish directory: `dist`
   - اضف متغيرات البيئة الحسّاسة في Netlify → Site settings → Build & deploy → Environment

4) نشر بديل (Netlify CLI) — إذا رغبت بنشر النسخة التي بنتها محليًا:
```
# تسجيل الدخول (مرة واحدة)
npx netlify-cli login

# نشر بعد البناء محليًا
npx netlify deploy --prod --dir=promohive/dist
```

5) ملاحظات أمانية
   - سأستبعد `promohive/.env` من فرع نشر يجعله نظيفًا لكن النسخة في main تبقى كما هي. إذا تريد حذف `.env` من تاريخ git فهذا إجراء آخر يتطلّب خطوات خاصة (BFG أو git filter-repo).
   - إن كان ملف .env يحتوي مفاتيح فعلية، دوّر (rotate) تلك المفاتيح فور الانتهاء.
