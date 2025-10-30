# متطلبات المشروع - PromoHive

## المتطلبات الرئيسية

### 1. إزالة "Or continue with GitHub" من واجهة الدخول

### 2. حدود السحب والإيداع
- أقل حد سحب: 10$
- أقل حد إيداع: 50$

### 3. نظام الإدارة
- صفحة الإدارة مرئية فقط للمستخدمين ذوي دور ADMIN/SUPER_ADMIN
- التعرف التلقائي على الإداريين من بيانات المستخدم
- صلاحيات المشرف:
  - إنشاء/تعديل/حذف المهام
  - الموافقة/الرفض للأدلّة اليدوية
  - إدارة مستويات المستخدمين
  - تعديل الأرصدة
  - إدارة عناوين إيداع USDT
  - معالجة طلبات السحب

### 4. نظام المستويات المدفوع
- Level 0: مجاني، مكافأة ترحيبية 5$ (حد أقصى 9.90$ تلقائي)
- Level 1: 50$
- Level 2: 100$
- Level 3: 150$

### 5. نظام الإحالات
- مكافآت إحالة مدفوعة عند استيفاء شروط محددة (مخفية عن المستخدمين)
- Level 1: دعوة 5 مستخدمين بنفس المستوى → ربح 80$
- Level 2: دعوة مستخدمين بنفس المستوى → ربح 150$

### 6. عجلة الحظ
- يومية
- حد أقصى جائزة يومية: 0.30$ لكل مستخدم

### 7. البريد الإلكتروني
```
SMTP_HOST='smtp.hostinger.com'
SMTP_PORT='465'
SMTP_SECURE='true'
SMTP_USER='promohive@globalpromonetwork.store'
SMTP_PASS='PromoHive@2025!'
SMTP_FROM='promohive@globalpromonetwork.store'
```

### 8. رقم الواتساب للعملاء
+17253348692

### 9. صفحة الإدارة - إعدادات قابلة للتعديل
- تعديل رقم الواتساب
- تعديل البريد الإلكتروني
- تعديل المكافأة الترحيبية
- إضافة عروض أخرى (مثل تحميل التطبيق)

### 10. مهام AdGem التلقائية
- يجب إضافة تبويب/صفحة لمهام AdGem التلقائية

### 11. نظام المحفظة
- محفظة خاصة لكل عميل
- النظام يحسب النقاط تلقائياً ويضيفها للمحفظة
- المهام التي تحتاج موافقة الإدارة: بعد التحقق يُضاف الرصيد تلقائياً
- رصيد الإحالات يُضاف تلقائياً

## نموذج البيانات (Prisma Schema)

```prisma
model User {
  id               String        @id @default(cuid())
  username         String        @unique
  email            String        @unique
  password         String
  role             Role          @default(USER) // USER | ADMIN | SUPER_ADMIN
  level            Int           @default(0)    // 0,1,2,3,...
  balance          Decimal       @default(0)
  pendingBalance   Decimal       @default(0)
  welcomeBonusUsed Boolean       @default(false)
  referrals        Referral[]
  usdtAddresses    USDTAddress[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model USDTAddress {
  id        String   @id @default(cuid())
  userId    String
  label     String?
  address   String
  network   String   // e.g. TRC20, ERC20
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Referral {
  id         String   @id @default(cuid())
  referrerId String
  referredId String   @unique
  level      Int
  bonus      Decimal  @default(0)
  isPaid     Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

## API Endpoints المطلوبة

### Admin Routes (محمي بـ adminGuard)
- GET /api/admin/dashboard
- GET /api/admin/users
- PATCH /api/admin/users/:id
- POST /api/admin/tasks
- PATCH /api/admin/tasks/:id
- GET /api/admin/proofs/pending
- POST /api/admin/proofs/:id/review
- GET /api/admin/usdt-addresses
- POST /api/admin/usdt-addresses
- POST /api/admin/withdrawals/:id/process
- GET /api/admin/referrals/pending-rewards
- POST /api/admin/settings

### User Routes
- GET /api/user/me
- GET /api/wallet/deposit-addresses
- POST /api/upgrade
- POST /api/spin
- GET /api/referrals/link
- GET /api/referrals/stats

## قواعد الأمان
- جميع التعديلات على الأرصدة داخل معاملات قاعدة بيانات
- تسجيل كل التعديلات في AdminAction و Transaction و AuditLog
- adminGuard يتحقق من JWT والصلاحيات
- عدم الاعتماد على client-side فقط للحماية

## الرسائل التلقائية
- رسالة ترحيب عند قبول الحساب مع إشعار بالهدية الترحيبية 5$
- إشعارات عند قبول/رفض المهام
- إشعارات عند التعديلات على الحساب
