# 🎁 دليل ربط AdGem - PromoHive

## ✅ الخبر السار!

**تطبيقك يحتوي بالفعل على نظام AdGem كامل!** 🎉

النظام يشمل:
- ✅ جدول لتخزين عروض AdGem
- ✅ نظام مكافآت حسب المستوى (Level-based rewards)
- ✅ واجهات API جاهزة
- ✅ 5 عروض تجريبية

---

## 🔑 ما تحتاجه للربط مع AdGem:

### 1. حساب AdGem
- الموقع: https://www.adgem.com/
- التسجيل كـ **Publisher**

### 2. AdGem API Credentials
ستحتاج:
- **Publisher ID**
- **API Key**
- **Offer Wall URL**

---

## 📊 كيف يعمل النظام:

### نظام المكافآت الذكي:

| مستوى المستخدم | نسبة المكافأة | مثال: عرض بـ $10 |
|----------------|---------------|------------------|
| Level 0 | 10% | يحصل على $1.00 |
| Level 1 | 25% | يحصل على $2.50 |
| Level 2 | 40% | يحصل على $4.00 |
| Level 3 | 55% | يحصل على $5.50 |
| Level 4 | 70% | يحصل على $7.00 |
| Level 5+ | 85% | يحصل على $8.50 |

**لماذا؟**
- تشجيع المستخدمين على الترقية
- حماية من الاحتيال (المستخدمون الجدد يحصلون على نسبة أقل)
- زيادة الأرباح من الفرق

---

## 🚀 خطوات الربط:

### الخطوة 1: الحصول على حساب AdGem

#### 1. اذهب إلى:
```
https://www.adgem.com/publishers
```

#### 2. سجل كـ Publisher:
- املأ معلومات الشركة/التطبيق
- أضف معلومات الدفع
- انتظر الموافقة (عادة 24-48 ساعة)

#### 3. بعد الموافقة:
- اذهب إلى Dashboard
- احصل على:
  - **Publisher ID**
  - **API Key**
  - **Offer Wall URL**

---

### الخطوة 2: إضافة AdGem Credentials في Supabase

#### أنشئ Supabase Edge Function لـ AdGem Sync:

سأنشئ لك الدالة جاهزة ↓

---

### الخطوة 3: إضافة عروض AdGem

لديك خيارين:

#### الخيار A: يدوياً عبر Dashboard

1. افتح Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/editor
   ```

2. افتح جدول `adgem_offers`

3. اضغط "Insert row"

4. أدخل البيانات:
   ```
   external_id: adgem_006 (معرف فريد)
   title: عنوان العرض
   description: وصف العرض
   real_value: 10.00 (القيمة الحقيقية)
   currency: USD
   countries: {US, CA, UK}
   device_types: {mobile, desktop}
   category: gaming
   external_url: https://adgem.com/offer/123
   requirements: {"min_level": 1}
   is_active: true
   ```

#### الخيار B: تلقائياً عبر API

سأنشئ لك Edge Function لجلب العروض تلقائياً من AdGem ↓

---

## 📝 العروض التجريبية الموجودة:

حالياً لديك 5 عروض تجريبية:

| ID | العنوان | القيمة | الفئة |
|----|---------|--------|-------|
| adgem_001 | Download Gaming App | $5.00 | gaming |
| adgem_002 | Survey: Shopping Habits | $3.50 | survey |
| adgem_003 | Install Finance App | $8.00 | finance |
| adgem_004 | Watch Video Series | $2.25 | entertainment |
| adgem_005 | Casino Game Trial | $12.00 | casino |

**ملاحظة:** هذه عروض تجريبية بروابط وهمية. ستحتاج لاستبدالها بعروض AdGem الحقيقية.

---

## 🔄 كيفية مزامنة العروض تلقائياً:

سأنشئ لك:

1. **Edge Function** لجلب العروض من AdGem API
2. **Scheduled Function** لتحديث العروض تلقائياً كل 24 ساعة
3. **Admin Panel** لإدارة العروض

---

## 🎨 واجهة المستخدم:

### كيف يرى المستخدم العروض:

```javascript
// في صفحة Tasks List
const offers = await adgemService.getAdgemOffers(userId);

// سيحصل المستخدم على:
{
  title: "Download Gaming App",
  display_reward: 2.50, // حسب مستواه (مثلاً Level 1 = 25%)
  description: "...",
  external_url: "https://adgem.com/offer/123"
}
```

**القيمة الحقيقية ($5.00) مخفية عن المستخدم!**

---

## 💰 كيف تربح:

### مثال:
- AdGem يدفع لك: **$10.00** عن عرض
- مستخدم Level 2 يكمل العرض
- يحصل المستخدم: **$4.00** (40%)
- ربحك: **$6.00** (60%)

### مع 100 مستخدم يكملون العرض:
- AdGem يدفع: **$1,000**
- تدفع للمستخدمين: ~**$400** (متوسط)
- ربحك: ~**$600**

---

## 🛡️ الحماية من الاحتيال:

النظام يتضمن:
- ✅ Level-based rewards (المستخدمون الجدد نسبة أقل)
- ✅ Email verification required
- ✅ Admin approval system
- ✅ Minimum level للعروض الكبيرة
- ✅ Proof submission system

---

## 📱 المميزات المتقدمة:

### 1. فلترة حسب الدولة:
```sql
SELECT * FROM adgem_offers 
WHERE 'US' = ANY(countries);
```

### 2. فلترة حسب الجهاز:
```sql
SELECT * FROM adgem_offers 
WHERE 'mobile' = ANY(device_types);
```

### 3. حساب المكافأة للمستخدم:
```sql
SELECT public.get_user_display_reward(10.00, user_id);
-- Returns: 2.50 for Level 1 user
```

---

## 🔧 الخطوات التالية:

### للبدء بـ AdGem الحقيقي:

1. ✅ سجل في AdGem كـ Publisher
2. ✅ احصل على API credentials
3. ✅ سأنشئ لك Edge Function للمزامنة
4. ✅ استبدل العروض التجريبية بعروض حقيقية

---

## 🆘 هل تريد مني:

1. **إنشاء Edge Function لمزامنة العروض تلقائياً؟**
2. **إنشاء Admin Panel لإدارة العروض؟**
3. **إضافة المزيد من العروض التجريبية؟**
4. **شرح كيفية ربط Postback URLs؟**

---

## 📚 الملفات ذات الصلة:

- **Services:** `src/services/adgemService.js`
- **Migration:** `supabase/migrations/20241029230701_add_adgem_integration.sql`
- **Database:** جداول `adgem_offers`, `level_reward_config`

---

**أخبرني ماذا تريد أن نفعل الآن؟** 🚀

1. هل لديك حساب AdGem بالفعل؟
2. هل تريد إضافة عروض يدوياً أو تلقائياً؟
3. هل تريد شرح تفصيلي لأي جزء؟
