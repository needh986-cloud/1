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
        subject: "Email Verification - PromoHive",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #f8f9fa; 
                margin: 0; 
                padding: 20px; 
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
                <h1>🎉 Welcome to PromoHive</h1>
                <p>Hello ${fullName || 'Dear User'}</p>
              </div>
              
              <div class="content">
                <h2>Email Verification</h2>
                <p>Thank you for registering on PromoHive platform. To complete the registration process, please use the following verification code:</p>
                
                <div class="code-container">
                  <div class="verification-code">${verificationCode}</div>
                </div>
                
                <p><strong>Valid for 10 minutes only</strong></p>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> After confirming your email, your account will be reviewed by the admin before activating the $5 welcome bonus.
                </div>
                
                <p>If you did not create an account on our platform, please ignore this email.</p>
              </div>
              
              <div class="footer">
                <p>© 2022 PromoHive - Secure Promotional Task Platform</p>
                <p>This email was sent automatically, please do not reply to it</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hello ${fullName || 'Dear User'},

Thank you for registering on PromoHive platform.

Your verification code is: ${verificationCode}

The code is valid for 10 minutes only.

Important: After confirming your email, your account will be reviewed by the admin before activating the welcome bonus.

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
      message: "Verification code has been sent to your email",
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
      error: "Failed to send verification code. Please try again.",
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