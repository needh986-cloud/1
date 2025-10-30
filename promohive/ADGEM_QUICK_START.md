# 🚀 AdGem - دليل البدء السريع

## ✅ ما هو موجود بالفعل:

تطبيقك يحتوي على نظام AdGem **كامل وجاهز**! يشمل:

### قاعدة البيانات:
- ✅ جدول `adgem_offers` - لتخزين العروض
- ✅ جدول `level_reward_config` - نظام المكافآت
- ✅ 5 عروض تجريبية جاهزة

### الكود:
- ✅ `adgemService.js` - جميع الوظائف جاهزة
- ✅ نظام مكافآت ذكي (10% - 85% حسب المستوى)
- ✅ حماية من الاحتيال

### Edge Function جديد:
- ✅ `sync-adgem-offers` - لمزامنة العروض تلقائياً

---

## 📋 ما تحتاجه للبدء:

### الخيار 1: استخدام العروض التجريبية (للاختبار) ⚡

**لا تحتاج أي شيء!** العروض التجريبية موجودة بالفعل.

فقط اذهب إلى:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/editor
```
افتح جدول `adgem_offers` وستجد 5 عروض جاهزة ✅

---

### الخيار 2: ربط AdGem حقيقي (للإنتاج) 💰

تحتاج:

#### 1. حساب AdGem Publisher
- سجل في: https://www.adgem.com/publishers
- املأ معلومات التطبيق
- انتظر الموافقة (24-48 ساعة)

#### 2. احصل على Credentials:
بعد الموافقة، احصل على:
- **ADGEM_API_KEY** (مثل: `ag_live_abc123...`)
- **ADGEM_PUBLISHER_ID** (مثل: `12345`)

#### 3. أضفها في Supabase:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions
```

في قسم **Secrets**، أضف:
- Name: `ADGEM_API_KEY` → Value: [المفتاح]
- Name: `ADGEM_PUBLISHER_ID` → Value: [المعرف]

#### 4. رفع Edge Function:
```bash
supabase functions deploy sync-adgem-offers
```

أو يدوياً عبر Dashboard (نفس طريقة send-verification-email)

---

## 🎯 كيفية إضافة عروض يدوياً:

### الطريقة السهلة (3 دقائق):

1. **افتح Supabase Editor:**
   ```
   https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/editor
   ```

2. **اختر جدول `adgem_offers`**

3. **اضغط "Insert" → "Insert row"**

4. **املأ البيانات:**

```json
{
  "external_id": "my_offer_001",
  "title": "Download Mobile App",
  "description": "Download and register in this app",
  "real_value": 15.00,
  "currency": "USD",
  "countries": ["US", "CA", "UK"],
  "device_types": ["mobile"],
  "category": "app_download",
  "external_url": "https://your-tracking-link.com",
  "requirements": {"min_level": 1},
  "is_active": true
}
```

5. **اضغط "Save"** ✅

---

## 💡 كيف يعمل نظام المكافآت:

### مثال عملي:

أنت تضيف عرض بقيمة **$10.00**

| المستخدم | مستواه | يحصل على | أنت تربح |
|----------|--------|----------|----------|
| Ahmed | Level 0 | $1.00 (10%) | $9.00 |
| Sara | Level 2 | $4.00 (40%) | $6.00 |
| Mohamed | Level 5 | $8.50 (85%) | $1.50 |

**لماذا هذا ذكي؟**
- المستخدمون الجدد يحصلون على أقل → حماية من الاحتيال
- المستخدمون المخلصون يحصلون على أكثر → تحفيز
- أنت تربح من الفرق → نموذج عمل مربح

---

## 🔄 المزامنة التلقائية (اختياري):

### إذا رفعت `sync-adgem-offers`:

#### يدوياً:
```bash
curl -X POST \
  https://jtxmijnxrgcwjvtdlgxy.supabase.co/functions/v1/sync-adgem-offers \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### تلقائياً (كل 24 ساعة):
أضف Cron Job في Supabase:
```
https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/database/cron
```

---

## 📊 كيف يستخدم المستخدمون العروض:

### في صفحة Tasks:

```javascript
// المستخدم يرى:
{
  title: "Download Gaming App",
  reward: "$2.50",  // حسب مستواه (مثلاً Level 1)
  description: "...",
  category: "gaming"
}

// القيمة الحقيقية ($5.00) مخفية!
```

### عند الضغط على العرض:
1. يُفتح الرابط الخارجي (external_url)
2. المستخدم يكمل المهمة
3. يرفع إثبات (proof)
4. Admin يراجع ويوافق
5. المستخدم يحصل على مكافأته

---

## 🎨 العروض التجريبية الحالية:

| العرض | القيمة | Level 0 يحصل | Level 5 يحصل |
|-------|--------|--------------|---------------|
| Gaming App | $5.00 | $0.50 | $4.25 |
| Survey | $3.50 | $0.35 | $2.98 |
| Finance App | $8.00 | $0.80 | $6.80 |
| Video Series | $2.25 | $0.23 | $1.91 |
| Casino Game | $12.00 | $1.20 | $10.20 |

---

## ✅ قائمة التحقق:

### للاختبار الآن (بدون AdGem):
- [x] قاعدة البيانات جاهزة
- [x] 5 عروض تجريبية موجودة
- [ ] جرب عرض الصفحة في التطبيق
- [ ] اختبر نظام المكافآت

### للإنتاج (مع AdGem):
- [ ] سجل في AdGem Publisher
- [ ] احصل على API credentials
- [ ] أضف Secrets في Supabase
- [ ] رفع sync-adgem-offers function
- [ ] اختبر المزامنة

---

## 🆘 أسئلة شائعة:

### س: هل يجب أن أستخدم AdGem؟
**ج:** لا! يمكنك:
- إضافة عروضك الخاصة يدوياً
- استخدام شبكات أخرى (CPALead, OGAds, etc.)
- الجمع بين عدة مصادر

### س: كيف أغير نسب المكافآت؟
**ج:** عدّل جدول `level_reward_config`:
```sql
UPDATE level_reward_config 
SET reward_percentage = 50.00 
WHERE level = 2;
```

### س: كيف أضيف متطلبات للعروض؟
**ج:** في حقل `requirements`:
```json
{
  "min_level": 2,
  "countries": ["US", "CA"],
  "min_age": 18,
  "verified_email": true
}
```

---

## 📚 الملفات المهمة:

- **الدليل الكامل:** `ADGEM_INTEGRATION_GUIDE.md`
- **الكود:** `src/services/adgemService.js`
- **Migration:** `supabase/migrations/20241029230701_add_adgem_integration.sql`
- **Edge Function:** `supabase/functions/sync-adgem-offers/index.ts`

---

## 🎯 الخطوات التالية:

**ماذا تريد أن تفعل الآن؟**

1. **اختبار العروض التجريبية** → جاهز! افتح التطبيق
2. **إضافة عروض يدوياً** → اتبع "كيفية إضافة عروض يدوياً" أعلاه
3. **ربط AdGem حقيقي** → اتبع "الخيار 2" أعلاه
4. **تخصيص نسب المكافآت** → عدّل `level_reward_config`

**أخبرني أي خيار تريد وسأساعدك!** 🚀
