# 🔐 كيفية الحصول على Service Role Key

## الخطوات:

### 1. افتح إعدادات API:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/api
```

### 2. انزل إلى قسم "Project API keys"

سترى 3 مفاتيح:

```
┌─────────────────────────────────────────────────────┐
│ Project API keys                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📗 anon / public                                    │
│    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...         │
│    ↑ للاستخدام في Frontend (محدود)                │
│                                                     │
│ 🔴 service_role                                     │
│    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...         │
│    ↑ هذا هو المطلوب! (صلاحيات كاملة)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. انسخ service_role key

⚠️ **مهم جداً:**
- هذا المفتاح له صلاحيات admin كاملة
- لا تشاركه في GitHub أو أي مكان عام
- استخدمه فقط في Backend أو مع الـ AI Assistant

### 4. أرسله لي بشكل خاص

بعد نسخه، أرسله لي وسأستطيع:
✅ تنفيذ SQL migrations مباشرة
✅ تحديث الـ schema
✅ إضافة/تعديل البيانات
✅ رفع Edge Functions (إذا أعطيتني أيضاً Access Token)

---

## البدائل الأخرى:

### الخيار 2: Supabase Access Token
1. اذهب إلى: https://supabase.com/dashboard/account/tokens
2. اضغط "Generate new token"
3. انسخ الـ token وأرسله لي

مع هذا Token يمكنني:
✅ رفع Edge Functions
✅ تنفيذ Migrations
✅ إدارة المشروع بالكامل

---

## الخيار 3: Database Connection String

إذا أردت إعطائي وصول مباشر للـ Database:

1. اذهب إلى:
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/database
   ```

2. انسخ **"Connection string"** من قسم "Connection string"
3. اختر **"URI"** format
4. أرسله لي (يحتوي على password)

مع هذا يمكنني:
✅ تنفيذ أي SQL commands مباشرة
✅ تحديث Schema
✅ إدارة البيانات

---

## ⚡ أي خيار أسهل لك؟

**الأسرع:** Service Role Key (دقيقة واحدة)
**الأشمل:** Access Token (يسمح بكل شيء)
**الأقوى:** Database Connection String (وصول مباشر)

فقط أعطني أي واحد من الثلاثة وسأقوم بكل شيء نيابة عنك! 🚀
