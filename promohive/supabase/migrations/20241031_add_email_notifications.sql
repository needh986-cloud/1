-- Email Notifications System
-- Date: 2025-10-31
-- Purpose: Add email notification settings and templates

-- ============================================================================
-- 1. UPDATE ADMIN SETTINGS WITH SMTP CONFIGURATION
-- ============================================================================

-- Add SMTP settings if not exists
INSERT INTO public.admin_settings (key, value, description, category, data_type, is_public) VALUES
    ('smtp_host', 'smtp.hostinger.com', 'SMTP server host', 'email', 'string', false),
    ('smtp_port', '465', 'SMTP server port', 'email', 'number', false),
    ('smtp_secure', 'true', 'Use SSL/TLS for SMTP', 'email', 'boolean', false),
    ('smtp_user', 'promohive@globalpromonetwork.store', 'SMTP username/email', 'email', 'string', false),
    ('smtp_password', 'PromoHive@2025!', 'SMTP password', 'email', 'string', false),
    ('smtp_from', 'promohive@globalpromonetwork.store', 'Email from address', 'email', 'string', false),
    ('smtp_from_name', 'PromoHive', 'Email from name', 'email', 'string', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. CREATE EMAIL TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]', -- List of available variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CREATE EMAIL LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    template_key TEXT,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- ============================================================================
-- 4. INSERT DEFAULT EMAIL TEMPLATES
-- ============================================================================

INSERT INTO public.email_templates (template_key, subject, body_html, body_text, variables) VALUES
(
    'welcome_approved',
    'مرحباً بك في PromoHive - تم تفعيل حسابك!',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5; text-align: center;">مرحباً بك في PromoHive! 🎉</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">نحن سعداء بانضمامك إلى منصة PromoHive!</p>
            <div style="background-color: #F0FDF4; border-right: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #059669;">✅ <strong>تم تفعيل حسابك بنجاح!</strong></p>
            </div>
            <div style="background-color: #FEF3C7; border-right: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #D97706;">🎁 <strong>مكافأة ترحيبية: $5.00</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400E;">تم إضافة مكافأة ترحيبية إلى محفظتك!</p>
            </div>
            <p style="font-size: 16px; color: #333;">يمكنك الآن تسجيل الدخول والبدء في كسب المال من خلال إكمال المهام المتاحة.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">تسجيل الدخول الآن</a>
            </div>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="font-size: 14px; color: #6B7280; text-align: center;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا</p>
            <p style="font-size: 14px; color: #6B7280; text-align: center;">
                📧 <a href="mailto:{{support_email}}" style="color: #4F46E5;">{{support_email}}</a><br>
                📱 <a href="https://wa.me/{{support_phone}}" style="color: #4F46E5;">{{support_phone}}</a>
            </p>
        </div>
    </div>',
    'مرحباً بك في PromoHive!\n\nعزيزي/عزيزتي {{username}}،\n\nنحن سعداء بانضمامك إلى منصة PromoHive!\n\n✅ تم تفعيل حسابك بنجاح!\n🎁 مكافأة ترحيبية: $5.00\n\nيمكنك الآن تسجيل الدخول والبدء في كسب المال.\n\nرابط تسجيل الدخول: {{login_url}}\n\nللدعم:\nالبريد: {{support_email}}\nالهاتف: {{support_phone}}',
    '["username", "login_url", "support_email", "support_phone"]'::jsonb
),
(
    'task_approved',
    'تم قبول مهمتك - تم إضافة الرصيد',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">تم قبول مهمتك! ✅</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">تم مراجعة وقبول المهمة التي أرسلتها:</p>
            <div style="background-color: #F0FDF4; border-right: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>المهمة:</strong> {{task_title}}</p>
                <p style="margin: 10px 0 0 0; font-size: 18px; color: #059669;"><strong>المكافأة:</strong> ${{amount}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">تم إضافة المبلغ إلى محفظتك ويمكنك سحبه في أي وقت.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{wallet_url}}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">عرض المحفظة</a>
            </div>
        </div>
    </div>',
    'تم قبول مهمتك!\n\nعزيزي/عزيزتي {{username}}،\n\nتم مراجعة وقبول المهمة: {{task_title}}\nالمكافأة: ${{amount}}\n\nتم إضافة المبلغ إلى محفظتك.\n\nرابط المحفظة: {{wallet_url}}',
    '["username", "task_title", "amount", "wallet_url"]'::jsonb
),
(
    'task_rejected',
    'تم رفض مهمتك',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #EF4444; text-align: center;">تم رفض مهمتك ❌</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">للأسف، تم رفض المهمة التي أرسلتها:</p>
            <div style="background-color: #FEE2E2; border-right: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>المهمة:</strong> {{task_title}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #991B1B;"><strong>السبب:</strong> {{rejection_reason}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">يمكنك إعادة المحاولة أو التواصل مع الدعم للمزيد من المعلومات.</p>
        </div>
    </div>',
    'تم رفض مهمتك\n\nعزيزي/عزيزتي {{username}}،\n\nتم رفض المهمة: {{task_title}}\nالسبب: {{rejection_reason}}\n\nيمكنك إعادة المحاولة أو التواصل مع الدعم.',
    '["username", "task_title", "rejection_reason"]'::jsonb
),
(
    'withdrawal_approved',
    'تم قبول طلب السحب',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">تم قبول طلب السحب! ✅</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">تم معالجة طلب السحب الخاص بك بنجاح:</p>
            <div style="background-color: #F0FDF4; border-right: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>المبلغ:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>الشبكة:</strong> {{network}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>العنوان:</strong> {{usdt_address}}</p>
                {{#if tx_hash}}
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>رقم المعاملة:</strong> {{tx_hash}}</p>
                {{/if}}
            </div>
            <p style="font-size: 16px; color: #333;">تم إرسال المبلغ إلى عنوان USDT الخاص بك.</p>
        </div>
    </div>',
    'تم قبول طلب السحب!\n\nعزيزي/عزيزتي {{username}}،\n\nالمبلغ: ${{amount}}\nالشبكة: {{network}}\nالعنوان: {{usdt_address}}\nرقم المعاملة: {{tx_hash}}\n\nتم إرسال المبلغ بنجاح.',
    '["username", "amount", "network", "usdt_address", "tx_hash"]'::jsonb
),
(
    'withdrawal_rejected',
    'تم رفض طلب السحب',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #EF4444; text-align: center;">تم رفض طلب السحب ❌</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">للأسف، تم رفض طلب السحب الخاص بك:</p>
            <div style="background-color: #FEE2E2; border-right: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>المبلغ:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #991B1B;"><strong>السبب:</strong> {{rejection_reason}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">تم إرجاع المبلغ إلى محفظتك. يمكنك التواصل مع الدعم للمزيد من المعلومات.</p>
        </div>
    </div>',
    'تم رفض طلب السحب\n\nعزيزي/عزيزتي {{username}}،\n\nالمبلغ: ${{amount}}\nالسبب: {{rejection_reason}}\n\nتم إرجاع المبلغ إلى محفظتك.',
    '["username", "amount", "rejection_reason"]'::jsonb
),
(
    'deposit_verified',
    'تم تأكيد الإيداع',
    '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">تم تأكيد الإيداع! ✅</h1>
            <p style="font-size: 16px; color: #333;">عزيزي/عزيزتي <strong>{{username}}</strong>،</p>
            <p style="font-size: 16px; color: #333;">تم تأكيد الإيداع الخاص بك بنجاح:</p>
            <div style="background-color: #F0FDF4; border-right: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>المبلغ:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>الشبكة:</strong> {{network}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">تم إضافة المبلغ إلى محفظتك ويمكنك استخدامه الآن.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{wallet_url}}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">عرض المحفظة</a>
            </div>
        </div>
    </div>',
    'تم تأكيد الإيداع!\n\nعزيزي/عزيزتي {{username}}،\n\nالمبلغ: ${{amount}}\nالشبكة: {{network}}\n\nتم إضافة المبلغ إلى محفظتك.\n\nرابط المحفظة: {{wallet_url}}',
    '["username", "amount", "network", "wallet_url"]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
    subject = EXCLUDED.subject,
    body_html = EXCLUDED.body_html,
    body_text = EXCLUDED.body_text,
    variables = EXCLUDED.variables,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.email_templates IS 'Email templates for automated notifications';
COMMENT ON TABLE public.email_logs IS 'Log of all sent emails';
