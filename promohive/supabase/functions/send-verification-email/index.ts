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
    const { email, verificationCode, fullName } = await req?.json();

    // Validate required fields
    if (!email || !verificationCode) {
      return new Response(JSON.stringify({
        error: "Missing required fields: email, verificationCode"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
        }
      });
    }

    // Send verification email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${globalThis.Deno?.env?.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [email],
        subject: "تأكيد بريدك الإلكتروني - PromoHive",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تأكيد البريد الإلكتروني</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #f8f9fa; 
                margin: 0; 
                padding: 20px; 
                direction: rtl;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
                overflow: hidden;
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
              }
              .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700; 
              }
              .content { 
                padding: 40px 30px; 
                text-align: center; 
              }
              .code-container { 
                background: #f1f3f4; 
                border: 2px dashed #667eea; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 30px 0; 
              }
              .verification-code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #667eea; 
                letter-spacing: 4px; 
                font-family: 'Courier New', monospace;
              }
              .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                border-radius: 6px; 
                padding: 15px; 
                margin: 20px 0; 
                color: #856404;
              }
              .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                color: #6c757d; 
                font-size: 14px; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 مرحباً بك في PromoHive</h1>
                <p>أهلاً وسهلاً ${fullName || 'عزيزي المستخدم'}</p>
              </div>
              
              <div class="content">
                <h2>تأكيد البريد الإلكتروني</h2>
                <p>شكراً لك على التسجيل في منصة PromoHive. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:</p>
                
                <div class="code-container">
                  <div class="verification-code">${verificationCode}</div>
                </div>
                
                <p><strong>صالح لمدة 10 دقائق فقط</strong></p>
                
                <div class="warning">
                  <strong>⚠️ مهم:</strong> بعد تأكيد بريدك الإلكتروني، سيتم مراجعة حسابك من قبل الإدارة قبل تفعيل مكافأة الترحيب البالغة 5$.
                </div>
                
                <p>إذا لم تقم بإنشاء حساب على منصتنا، يرجى تجاهل هذا البريد.</p>
              </div>
              
              <div class="footer">
                <p>© 2022 PromoHive - منصة المهام الترويجية الآمنة</p>
                <p>هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
مرحباً ${fullName || 'عزيزي المستخدم'}،

شكراً لك على التسجيل في منصة PromoHive.

رمز التحقق الخاص بك هو: ${verificationCode}

الرمز صالح لمدة 10 دقائق فقط.

مهم: بعد تأكيد بريدك الإلكتروني، سيتم مراجعة حسابك من قبل الإدارة قبل تفعيل مكافأة الترحيب.

© 2022 PromoHive
        `
      }),
    });

    if (!resendResponse?.ok) {
      const errorData = await resendResponse?.text();
      throw new Error(`Resend API error: ${errorData}`);
    }

    const resendData = await resendResponse?.json();

    return new Response(JSON.stringify({
      success: true,
      message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      emailId: resendData.id
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
    
  } catch (error) {
    console.error("Send verification email error:", error);
    
    return new Response(JSON.stringify({
      error: "فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
  }
});