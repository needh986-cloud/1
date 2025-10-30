# 🔧 دليل إصلاح قاعدة البيانات - PromoHive

## ⚡ المشاكل التي سيتم حلها:

1. ✅ إصلاح البيانات الوهمية في صفحة الأدمن - تم بالفعل في الكود
2. ✅ إصلاح عدم وصول البريد الإلكتروني برمز التحقق
3. ✅ إنشاء وظائف التحقق المفقودة في قاعدة البيانات
4. ✅ إصلاح سياسات RLS (Row Level Security)
5. ✅ إصلاح وظائف الموافقة والرفض للمستخدمين

---

## 📋 الخطوات المطلوبة:

### الخطوة 1️⃣: تشغيل سكريبت SQL الرئيسي

1. **افتح Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new
   ```

2. **انسخ محتوى الملف التالي بالكامل:**
   ```
   FIX_ALL_DATABASE_ISSUES.sql
   ```

3. **الصق السكريبت في SQL Editor**

4. **اضغط "Run" أو Ctrl+Enter**

5. **تحقق من النتائج:**
   يجب أن ترى رسائل النجاح في الأسفل:
   ```
   ✅ DATABASE FIXES COMPLETED SUCCESSFULLY!
   ✅ All functions created/updated
   ✅ RLS policies fixed
   ✅ Permissions granted
   ```

---

### الخطوة 2️⃣: إعداد RESEND API للبريد الإلكتروني

**مهم جداً:** لكي تعمل رسائل البريد الإلكتروني (رمز التحقق، البريد الترحيبي)

#### أ) الحصول على API Key من Resend:

1. **سجل في Resend (مجاناً):**
   ```
   https://resend.com/signup
   ```

2. **احصل على API Key:**
   ```
   https://resend.com/api-keys
   → Create API Key
   → Name: PromoHive
   → Type: Sending access
   → انسخ المفتاح (يبدأ بـ re_)
   ```

#### ب) إضافة API Key في Supabase:

1. **افتح Edge Functions Settings:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
   ```

2. **اذهب لقسم "Secrets"**

3. **أضف Secret جديد:**
   ```
   Name: RESEND_API_KEY
   Value: [الصق المفتاح الذي نسخته من Resend]
   ```

4. **احفظ التغييرات**

---

### الخطوة 3️⃣: رفع Edge Functions

**تحتاج إلى رفع وظيفة إرسال البريد الإلكتروني:**

#### الطريقة 1: عبر Supabase Dashboard (الأسهل)

1. **افتح Functions:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions
   ```

2. **تحقق من وجود `send-notification-email`**
   - إذا كانت موجودة: تأكد أنها "Active"
   - إذا لم تكن موجودة: انتقل للطريقة 2

#### الطريقة 2: عبر Supabase CLI

```bash
# 1. تسجيل الدخول
supabase login

# 2. ربط المشروع
supabase link --project-ref jtxmijnxrgcwjvtdlgxy

# 3. رفع الـ Edge Functions
supabase functions deploy send-notification-email

# 4. تحديث الـ Secrets
supabase secrets set RESEND_API_KEY=your_api_key_here
```

---

### الخطوة 4️⃣: اختبار النظام

#### أ) اختبار وظائف قاعدة البيانات:

افتح SQL Editor وجرب:

```sql
-- 1. التحقق من وجود الوظائف
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'approve_user',
    'reject_user',
    'create_verification_code',
    'verify_email_code'
);

-- 2. اختبار إنشاء رمز تحقق (استبدل القيم)
SELECT create_verification_code('test@example.com', 'user-uuid-here');

-- 3. عرض سياسات RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('email_verification_codes', 'user_profiles');
```

#### ب) اختبار البريد الإلكتروني:

1. **افتح Functions في Dashboard**
2. **اختر `send-notification-email`**
3. **اضغط "Invoke"**
4. **استخدم هذا الـ payload:**

```json
{
  "type": "welcome",
  "to": "your-test-email@gmail.com",
  "data": {
    "fullName": "Test User",
    "loginUrl": "https://promohive.com/login"
  }
}
```

5. **يجب أن يصلك بريد ترحيبي**

#### ج) اختبار التطبيق:

```bash
# 1. شغل التطبيق
cd /workspace/promohive
npm install
npm run dev

# 2. افتح المتصفح
# http://localhost:5173

# 3. سجل حساب جديد
# 4. افتح صفحة الأدمن (بحساب أدمن)
# 5. وافق على المستخدم الجديد
# 6. تحقق من وصول البريد الترحيبي
```

---

## 🎯 ملخص التغييرات:

### في قاعدة البيانات:
- ✅ إنشاء جدول `email_verification_codes`
- ✅ إضافة أعمدة التحقق في `user_profiles`
- ✅ إنشاء وظيفة `approve_user()`
- ✅ إنشاء وظيفة `reject_user()`
- ✅ إنشاء وظائف التحقق من البريد
- ✅ إصلاح سياسات RLS لجميع الجداول
- ✅ منح الصلاحيات الصحيحة

### في الكود (تم بالفعل):
- ✅ ربط صفحة الأدمن بالبيانات الحقيقية
- ✅ إصلاح وظائف الموافقة/الرفض
- ✅ تحديث تلقائي للبيانات بعد العمليات
- ✅ رسائل خطأ ونجاح واضحة بالعربية

### في Edge Functions:
- ✅ وظيفة إرسال البريد الترحيبي
- ✅ دعم Resend API
- ✅ تكامل مع وظيفة `approve_user()`

---

## ⚠️ ملاحظات مهمة:

1. **البريد الإلكتروني:** لن يعمل إلا بعد إضافة `RESEND_API_KEY`

2. **الصلاحيات:** تأكد أن حساب الأدمن لديه `role = 'admin'` في جدول `user_profiles`

3. **RLS Policies:** تم إصلاحها لتسمح للمستخدمين المجهولين (anon) بالتسجيل

4. **Service Role:** جميع الوظائف لها صلاحيات `SECURITY DEFINER` للعمل بشكل صحيح

---

## 🐛 استكشاف الأخطاء:

### مشكلة: "Failed to approve user"
**الحل:** تحقق من:
- هل الحساب المسجل دخوله لديه role = 'admin'؟
- هل الوظيفة `approve_user()` موجودة في قاعدة البيانات؟

### مشكلة: "Email not received"
**الحل:** تحقق من:
- هل RESEND_API_KEY موجود في Secrets؟
- هل Edge Function `send-notification-email` مرفوعة؟
- هل البريد في مجلد Spam؟

### مشكلة: "RLS policy violation"
**الحل:**
- شغل السكريبت `FIX_ALL_DATABASE_ISSUES.sql` مرة أخرى
- تأكد من منح الصلاحيات لجميع الأدوار (anon, authenticated, service_role)

### مشكلة: "Function does not exist"
**الحل:**
- شغل السكريبت SQL الرئيسي
- تحقق من Logs في Supabase Dashboard

---

## 📞 الدعم:

إذا واجهت أي مشاكل:

1. **تحقق من Logs:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/explorer
   ```

2. **راجع Browser Console:**
   اضغط F12 وابحث عن أخطاء

3. **تحقق من Network Tab:**
   لمعرفة أي طلبات فشلت

---

## ✅ قائمة التحقق النهائية:

- [ ] تشغيل `FIX_ALL_DATABASE_ISSUES.sql` بنجاح
- [ ] إضافة `RESEND_API_KEY` في Secrets
- [ ] رفع Edge Function `send-notification-email`
- [ ] اختبار إنشاء حساب جديد
- [ ] اختبار الموافقة على مستخدم من لوحة الأدمن
- [ ] التحقق من وصول البريد الترحيبي
- [ ] التحقق من إضافة مكافأة $5 للمستخدم

---

**تاريخ آخر تحديث:** 2025-10-30  
**الإصدار:** 1.0  
**الحالة:** ✅ جاهز للتطبيق
