# PromoHive - Deployment Guide

## 📦 Project Structure

This is the complete PromoHive application with all updates applied.

### What's Included:
- ✅ Frontend (React + Vite)
- ✅ Backend API routes
- ✅ Supabase migrations (5 files)
- ✅ Email notification system
- ✅ Withdrawal system (min $10)
- ✅ Deposit system (min $50)
- ✅ Referral system with hidden rewards
- ✅ Level system (0-3)
- ✅ Daily spin wheel
- ✅ Admin dashboard
- ✅ Complete branding (logos + icons)

---

## 🚀 Quick Start

### Step 1: Apply Database Migrations

**IMPORTANT:** You must apply these 3 migrations in order:

1. **Withdrawal System:**
   ```
   File: promohive/supabase/migrations/20241031_create_withdrawals_table.sql
   ```

2. **Deposit System:**
   ```
   File: promohive/supabase/migrations/20241031_create_deposits_table.sql
   ```

3. **Email Notifications:**
   ```
   File: promohive/supabase/migrations/20241031_add_email_notifications.sql
   ```

**How to apply:**
1. Go to: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/editor
2. Open "SQL Editor"
3. Copy each file content and paste in SQL Editor
4. Click "RUN"

### Step 2: Update Admin USDT Addresses

After applying migrations, run this in SQL Editor:

```sql
-- Delete sample addresses
DELETE FROM admin_deposit_addresses;

-- Add your real addresses
INSERT INTO admin_deposit_addresses (label, address, network, is_active) VALUES
    ('Main TRC20 Wallet', 'YOUR_REAL_TRC20_ADDRESS', 'TRC20', true),
    ('Main ERC20 Wallet', 'YOUR_REAL_ERC20_ADDRESS', 'ERC20', false);
```

### Step 3: Install Dependencies

```bash
cd promohive
pnpm install
```

### Step 4: Configure Environment

Make sure `.env` file has:
```
VITE_SUPABASE_URL=https://jtxmijnxrgcwjvtdlgxy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Run Development Server

```bash
pnpm dev
```

---

## 📊 System Features

### Level System (Hidden from Users)

| Level | Price | Referral Reward | Required Referrals |
|-------|-------|----------------|-------------------|
| 0 | Free | - | - |
| 1 | $50 | $80 | 5 same-level |
| 2 | $100 | $150 | 5 same-level |
| 3 | $150 | $200 | 3 same-level |

**Level 0 Rules (Hidden):**
- Welcome bonus: $5
- Maximum balance: $9.90
- Admin can override limit based on activity
- Users don't know about the limit

### Withdrawal System
- Minimum: $10
- Networks: TRC20, ERC20, BEP20
- Admin manual approval
- Automatic balance deduction on request
- Automatic refund on rejection

### Deposit System
- Minimum: $50
- Admin manual verification
- Supports payment proof upload
- Automatic balance credit on approval

### Email Notifications (6 Templates)
1. Welcome (with $5 bonus)
2. Task Approved
3. Task Rejected
4. Withdrawal Approved
5. Withdrawal Rejected
6. Deposit Verified

### Daily Spin Wheel
- Maximum daily reward: $0.30 per user
- Hidden probability logic

---

## 🔐 Admin Access

### Admin Routes
- `/admin` - Admin dashboard
- Protected by role check (admin/super_admin)

### Admin Capabilities
1. Approve/reject user registrations
2. Create/edit/delete tasks
3. Approve/reject task submissions
4. Process withdrawals
5. Verify deposits
6. Manage USDT addresses
7. Edit system settings
8. View all transactions
9. Manage user levels
10. Adjust user balances

---

## 📧 SMTP Configuration

Already configured in migrations:
```
Host: smtp.hostinger.com
Port: 465
Secure: SSL/TLS
User: promohive@globalpromonetwork.store
Password: PromoHive@2025!
```

---

## 📞 Support Information

- **WhatsApp:** +17253348692
- **Email:** promohive@globalpromonetwork.store

---

## 📁 Important Files

### Migrations (Apply in order):
1. `20241031_create_withdrawals_table.sql`
2. `20241031_create_deposits_table.sql`
3. `20241031_add_email_notifications.sql`

### Documentation:
- `FINAL_REPORT.md` - Complete report
- `DATABASE_SETUP_GUIDE.md` - Detailed database guide
- `QUICK_START.md` - Quick start guide
- `COMPLETE_UPDATES_SUMMARY.md` - Updates summary

### Branding:
- `public/assets/logo-dark.png`
- `public/assets/logo-light.png`
- `public/assets/icon-192.png`
- `public/assets/icon-512.png`
- `public/favicon.ico`

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All 3 migrations applied successfully
- [ ] Admin USDT addresses updated
- [ ] Email templates loaded (6 templates)
- [ ] SMTP settings configured
- [ ] Withdrawal system working
- [ ] Deposit system working
- [ ] Referral system working
- [ ] Level system working
- [ ] Daily spin working
- [ ] Admin dashboard accessible
- [ ] Email notifications sending

---

## ⚠️ Security Notes

1. **Never share SMTP password**
2. **Verify USDT addresses before activation**
3. **Keep database backups**
4. **Test all features before production**
5. **Monitor admin_actions table for auditing**

---

## 🎯 Production Deployment

### Recommended Steps:
1. Apply all migrations
2. Update USDT addresses
3. Test all features
4. Create super admin account
5. Configure email templates
6. Set up monitoring
7. Enable error logging
8. Deploy to production

---

**Version:** 2.0  
**Date:** 2024-10-30  
**Status:** ✅ Ready for Deployment
