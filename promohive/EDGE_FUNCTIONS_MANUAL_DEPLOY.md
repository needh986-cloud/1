# 📤 رفع Edge Functions يدوياً - دليل سريع

## 🎯 الهدف
رفع دالتين للبريد الإلكتروني بالإنجليزية

---

## 📍 الخطوات للدالة الأولى: send-verification-email

### 1. افتح Edge Functions
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
```

### 2. إنشاء/تعديل الدالة

**إذا وجدت `send-verification-email` موجودة:**
- اضغط عليها
- اضغط "Edit"

**إذا لم تكن موجودة:**
- اضغط "Create a new function"
- اسم الدالة: `send-verification-email`

### 3. انسخ الكود

افتح الملف في المسار:
```
promohive/supabase/functions/send-verification-email/index.ts
```

أو انسخ من هنا مباشرة (انزل للأسفل) ⬇️

### 4. اضغط "Deploy"

---

## 📍 الخطوات للدالة الثانية: send-notification-email

كرر نفس الخطوات السابقة مع:
- اسم الدالة: `send-notification-email`
- الكود من: `promohive/supabase/functions/send-notification-email/index.ts`

---

## ⚠️ مهم جداً: إضافة RESEND_API_KEY

### لماذا مطلوب؟
الدالات تحتاج هذا المفتاح لإرسال الإيميلات

### كيف تحصل عليه؟

#### 1. اذهب إلى Resend
```
https://resend.com/api-keys
```

#### 2. سجل حساب مجاني (إذا لم يكن لديك)

#### 3. اضغط "Create API Key"
- اسم المفتاح: `PromoHive`
- الصلاحيات: "Full Access"

#### 4. انسخ المفتاح (يبدأ بـ `re_...`)

#### 5. أضفه في Supabase
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
```

- انزل إلى قسم **"Secrets"**
- اضغط "Add new secret"
- **Name:** `RESEND_API_KEY`
- **Value:** [المفتاح الذي نسخته]
- اضغط "Save"

---

## ✅ اختبار الدالات

### بعد الرفع، اختبر:

1. افتح تطبيقك
2. جرب التسجيل بإيميل جديد
3. يجب أن يصل بريد التحقق **بالإنجليزية** ✅

---

## 📋 ملخص سريع

| الخطوة | المدة | الحالة |
|--------|------|--------|
| رفع send-verification-email | 2 دقيقة | ⏳ |
| رفع send-notification-email | 2 دقيقة | ⏳ |
| إضافة RESEND_API_KEY | 3 دقائق | ⏳ |
| اختبار النظام | 1 دقيقة | ⏳ |

**المجموع:** ~8 دقائق

---

## 🆘 مشاكل شائعة

### المشكلة: لا يصل البريد
**الحل:**
- تأكد من إضافة `RESEND_API_KEY`
- تحقق من Logs: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/edge-functions

### المشكلة: خطأ في Deploy
**الحل:**
- تأكد من نسخ الكود كاملاً
- تحقق من عدم وجود أخطاء في الكود

### المشكلة: البريد يصل بالعربية
**الحل:**
- تأكد من أنك نسخت الكود المحدث (الإنجليزي)
- أعد Deploy الدالة

---

## 🎉 النتيجة النهائية

بعد إتمام هذه الخطوات:
- ✅ التطبيق بالإنجليزية بالكامل
- ✅ التسجيل يعمل بدون أخطاء
- ✅ بريد التحقق يُرسل بالإنجليزية
- ✅ جميع الإشعارات بالإنجليزية

---

**تحتاج مساعدة؟** اسألني في أي خطوة! 🤝
