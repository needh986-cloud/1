import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // DO NOT CHANGE THIS
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*" // DO NOT CHANGE THIS
      }
    });
  }
  
  try {
    const { type, to, data } = await req?.json();
    
    // Get SMTP settings from environment or use defaults
    const RESEND_API_KEY = (globalThis as any)?.Deno?.env?.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    let subject = '';
    let htmlContent = '';
    
    // Generate email content based on type
    switch (type) {
      case 'welcome':
        subject = 'مرحباً بك في PromoHive - حسابك مُفعّل الآن!';
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">PromoHive</h1>
              <p style="color: #666; margin: 5px 0;">منصة المهام الترويجية الموثوقة</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">مرحباً ${data?.fullName || 'عزيزي المستخدم'}!</h2>
              
              <p style="line-height: 1.6; color: #374151;">
                نحن سعداء لانضمامك إلى PromoHive! تم قبول حسابك وتفعيله بنجاح.
              </p>
              
              <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0;">🎉 مكافأة الترحيب</h3>
                <p style="color: #065f46; margin: 0; font-weight: bold;">
                  تهانينا! لقد حصلت على مكافأة ترحيبية قدرها 5$ في حسابك
                </p>
              </div>
              
              <h3 style="color: #1e40af;">معلومات مهمة:</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li>الحد الأدنى للسحب: 10$</li>
                <li>الحد الأدنى للإيداع: 50$</li>
                <li>عجلة الحظ اليومية متاحة (جائزة قصوى 0.30$ يومياً)</li>
                <li>برنامج الإحالات المربح متاح</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data?.loginUrl || 'https://promohive.com/login'}" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ابدأ الآن
                </a>
              </div>
            </div>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">💬 تحتاج مساعدة؟</h3>
              <p style="color: #92400e; margin: 0; line-height: 1.6;">
                تواصل معنا عبر واتساب: 
                <a href="https://wa.me/17253348692" style="color: #92400e; font-weight: bold;">+1 725 334 8692</a><br>
                أو عبر البريد الإلكتروني: 
                <a href="mailto:promohive@globalpromonetwork.store" style="color: #92400e;">promohive@globalpromonetwork.store</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2022 PromoHive. جميع الحقوق محفوظة.<br>
                هذا الإيميل تم إرساله تلقائياً، يرجى عدم الرد عليه.
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'level_upgrade':
        subject = `تهانينا! تم ترقية حسابك إلى ${data?.levelName}`;
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">PromoHive</h1>
            </div>
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; border: 2px solid #22c55e;">
              <h2 style="color: #15803d;">🎉 تهانينا على الترقية!</h2>
              <p style="color: #374151; line-height: 1.6;">
                عزيزي ${data?.fullName}, تم ترقية حسابك بنجاح إلى <strong>${data?.levelName}</strong>
              </p>
              <p style="color: #374151;">
                المبلغ المدفوع: <strong>${data?.paidAmount}$</strong><br>
                تاريخ الترقية: <strong>${new Date()?.toLocaleDateString('ar-EG')}</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #6b7280; font-size: 12px;">© 2022 PromoHive</p>
            </div>
          </div>
        `;
        break;
        
      case 'withdrawal_approved':
        subject = 'تم الموافقة على طلب السحب';
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #ecfdf5; padding: 25px; border-radius: 10px;">
              <h2 style="color: #065f46;">✅ تم الموافقة على طلب السحب</h2>
              <p>المبلغ: <strong>${data?.amount}$</strong></p>
              <p>العنوان: <strong>${data?.address}</strong></p>
              <p>سيتم التحويل خلال 24 ساعة</p>
            </div>
          </div>
        `;
        break;
        
      case 'withdrawal_rejected':
        subject = 'تم رفض طلب السحب';
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #fef2f2; padding: 25px; border-radius: 10px;">
              <h2 style="color: #dc2626;">❌ تم رفض طلب السحب</h2>
              <p>المبلغ: <strong>${data?.amount}$</strong></p>
              <p>السبب: <strong>${data?.reason}</strong></p>
              <p>يرجى التواصل مع الدعم للمزيد من المعلومات</p>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error('Invalid email type');
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse?.ok) {
      const error = await emailResponse?.text();
      throw new Error(`Email sending failed: ${error}`);
    }

    const result = await emailResponse?.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      emailId: result.id
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
  }
});