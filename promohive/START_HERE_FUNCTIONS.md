# 🚀 ابدأ من هنا - رفع Edge Functions

## 📌 ما أنشأته لك:

✅ **FUNCTION_1_CODE.txt** - كود الدالة الأولى جاهز للنسخ  
✅ **FUNCTION_2_CODE.txt** - كود الدالة الثانية جاهز للنسخ  
✅ **EDGE_FUNCTIONS_MANUAL_DEPLOY.md** - دليل تفصيلي

---

## ⚡ الخطوات السريعة (5 دقائق):

### 1️⃣ افتح Edge Functions في المتصفح

انسخ والصق هذا الرابط:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
```

---

### 2️⃣ الدالة الأولى

**في Dashboard:**
- اضغط "Create a new function" (أو عدّل الموجودة)
- اسم الدالة: `send-verification-email`

**الكود:**
- افتح ملف: **`FUNCTION_1_CODE.txt`**
- انسخ كل المحتوى
- الصقه في Dashboard
- اضغط **"Deploy"**

---

### 3️⃣ الدالة الثانية

**كرر نفس الخطوات:**
- اسم الدالة: `send-notification-email`
- الكود من: **`FUNCTION_2_CODE.txt`**
- اضغط **"Deploy"**

---

### 4️⃣ إضافة RESEND_API_KEY (مهم! ⚠️)

بدون هذا المفتاح، لن تعمل الإيميلات!

**احصل على المفتاح:**
1. اذهب إلى: https://resend.com/api-keys
2. سجل حساب مجاني
3. اضغط "Create API Key"
4. انسخ المفتاح (يبدأ بـ `re_...`)

**أضفه في Supabase:**
1. اذهب إلى: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
2. قسم "Secrets" → "Add new secret"
3. Name: `RESEND_API_KEY`
4. Value: [المفتاح من Resend]
5. اضغط "Save"

---

## ✅ اختبار سريع

بعد الانتهاء:
1. افتح تطبيقك
2. جرب التسجيل بإيميل جديد
3. يجب أن يصل بريد التحقق **بالإنجليزية** 🎉

---

## 📊 الحالة

| المهمة | الحالة |
|--------|--------|
| ✅ إصلاح قاعدة البيانات | مكتمل |
| ⏳ رفع send-verification-email | يحتاج تنفيذ |
| ⏳ رفع send-notification-email | يحتاج تنفيذ |
| ⏳ إضافة RESEND_API_KEY | يحتاج تنفيذ |

---

## 🆘 تحتاج مساعدة؟

- اقرأ **EDGE_FUNCTIONS_MANUAL_DEPLOY.md** للتفاصيل
- أو اسألني مباشرة!

---

**المدة المتوقعة:** 5-8 دقائق ⏱️  
**الصعوبة:** سهل جداً 😊
