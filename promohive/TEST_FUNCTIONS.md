# 🧪 اختبار Edge Functions

## ✅ قائمة التحقق النهائية

قبل الاختبار، تأكد من:

### 1. الدالات مرفوعة
- [x] send-verification-email ✅
- [x] send-notification-email ✅

### 2. RESEND_API_KEY مضاف
- [ ] تحقق من: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
- [ ] يجب أن تجد في قسم "Secrets": `RESEND_API_KEY`

### 3. SQL Migration مطبق
- [x] تم إصلاح قاعدة البيانات ✅

---

## 🎯 اختبار التسجيل

### الطريقة 1: اختبار حقيقي (الأفضل)

1. **افتح تطبيقك**

2. **اذهب إلى صفحة التسجيل**

3. **أدخل بيانات جديدة:**
   - الاسم الكامل: Test User
   - البريد الإلكتروني: test@example.com (استخدم إيميل حقيقي لك!)
   - كلمة المرور: Test123456

4. **اضغط "Create Account"**

5. **النتيجة المتوقعة:**
   - ✅ لا يظهر خطأ "Database error"
   - ✅ تظهر صفحة التحقق (Verification)
   - ✅ يصل بريد إلكتروني بالإنجليزية مع كود مكون من 5 أرقام

---

### الطريقة 2: اختبار عبر Dashboard

#### اختبار send-verification-email:

1. **افتح الدالة:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions/send-verification-email
   ```

2. **اذهب إلى تبويب "Test"**

3. **أدخل هذا JSON:**
   ```json
   {
     "email": "your-email@example.com",
     "verificationCode": "12345",
     "fullName": "Test User"
   }
   ```
   (استبدل `your-email@example.com` بإيميلك الحقيقي)

4. **اضغط "Invoke function"**

5. **النتيجة المتوقعة:**
   ```json
   {
     "success": true,
     "message": "Verification code has been sent to your email",
     "emailId": "..."
   }
   ```

6. **تحقق من بريدك الإلكتروني** - يجب أن تجد:
   - موضوع: "Email Verification - PromoHive"
   - المحتوى بالإنجليزية
   - الكود: 12345

---

## 🔍 تحقق من Logs

إذا حدث أي خطأ، تحقق من السجلات:

```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/edge-functions
```

### أخطاء شائعة:

#### خطأ: "RESEND_API_KEY is not configured"
**الحل:** أضف RESEND_API_KEY في Settings → Functions → Secrets

#### خطأ: "Resend API error"
**الحل:** 
- تأكد من صحة RESEND_API_KEY
- تحقق من أن حساب Resend مفعّل

#### خطأ: "Database error saving new user"
**الحل:** تأكد من تطبيق SQL migration (يجب أن يكون تم بالفعل ✅)

---

## 📊 النتائج المتوقعة

### إذا نجح كل شيء:

1. ✅ **التسجيل يعمل** - بدون أخطاء
2. ✅ **البريد يصل** - خلال ثواني
3. ✅ **المحتوى بالإنجليزية** - كل النصوص English
4. ✅ **كود التحقق يعمل** - 5 أرقام صالحة لـ 10 دقائق

### في صفحة Statistics:

بعد الاختبار، ارجع إلى:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions/send-verification-email
```

يجب أن ترى:
- **Invocations:** 1 أو أكثر
- **Execution time:** بيانات تظهر
- **Logs:** سجلات الاستدعاءات

---

## 🎉 النجاح!

إذا رأيت هذه النتائج، فكل شيء يعمل بشكل ممتاز:

- [x] قاعدة البيانات محدثة
- [x] Edge Functions تعمل
- [x] الإيميلات تُرسل بالإنجليزية
- [x] التطبيق جاهز 100%

---

## 🆘 إذا لم ينجح:

1. **اكتب لي الخطأ بالضبط**
2. **أرسل screenshot من:**
   - رسالة الخطأ في التطبيق
   - Logs من Dashboard
3. **سأساعدك في الحل فوراً!** 🤝

---

**الآن جرب التسجيل واخبرني النتيجة!** 🚀
