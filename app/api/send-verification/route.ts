import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { Resend } from 'resend';

// Provide your Resend API Key inside .env.local as RESEND_API_KEY
// e.g. RESEND_API_KEY="re_123456789"
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify client token via Firebase Admin sdk
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const name = decodedToken.name || 'Chocolate Lover';

    if (!email) {
      return NextResponse.json({ error: 'Email missing' }, { status: 400 });
    }

    // Check if we have Resend API configured
    if (!resend) {
      return NextResponse.json({ 
        error: 'Resend API key missing in server config (RESEND_API_KEY in .env.local). Please configure it to send custom emails.' 
      }, { status: 500 });
    }

    // Generate Firebase magic verification link
    const actionCodeSettings = {
      // Must match the authorized domains in Firebase Console
      url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/verify-email` : 'http://localhost:3000/verify-email',
      handleCodeInApp: false,
    };
    
    // Generates the raw https://chocket... link
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

    // Read the email template html content (inline directly to avoid file reading issues on Vercel)
    const customHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0D0705;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #FFF3E0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1A0F0B;
      padding: 40px;
      border-radius: 16px;
      border: 1px solid #3E2723;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #c9a85c;
      font-size: 32px;
      margin: 0;
      letter-spacing: -1px;
    }
    .logo span {
      color: #D4AF37;
    }
    .content {
      text-align: center;
      line-height: 1.6;
      color: #FFF3E0;
    }
    .title {
      color: #D4AF37;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .text {
      color: #FFF3E0;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .button-container {
      margin: 40px 0;
    }
    .button {
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #1A0F0B !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 18px;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #3E2723;
      color: #FFF3E0;
      font-size: 12px;
    }
  </style>
</head>
<body style="background-color: #0D0705;">
  <div class="container" style="background-color: #1A0F0B; padding: 40px; border-radius: 16px; border: 1px solid #3E2723;">
    <div class="logo" style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #c9a85c; font-size: 32px; margin: 0;">Chocket<span style="color: #D4AF37;">.</span></h1>
    </div>
    
    <div class="content" style="text-align: center; color: #FFF3E0;">
      <div class="title" style="color: #D4AF37; font-size: 24px; margin-bottom: 20px; font-weight: bold;">Verify your email address 🍫✨</div>
      
      <div class="text" style="color: #FFF3E0; font-size: 16px; margin-bottom: 30px;">
        Hello ${name},<br><br>
        Welcome to the premium chocolate experience! We're thrilled to have you.<br><br>
        To ensure the security of your account and begin your journey with Chocket, please verify your email address by clicking the button below.
      </div>
      
      <div class="button-container" style="margin: 40px 0;">
        <a href="${verificationLink}" class="button" style="background: #D4AF37; color: #1A0F0B; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">Verify Email Now</a>
      </div>
      
      <div class="text" style="font-size: 14px; opacity: 0.6; color: #FFF3E0;">
        If you didn't create an account with Chocket, you can safely ignore this email.
      </div>
    </div>
    
    <div class="footer" style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #3E2723; color: #FFF3E0;">
      © 2026 Chocket Premium Chocolates. All rights reserved.<br>
      Sweetville, NY 10012
    </div>
  </div>
</body>
</html>
    `;

    // Send the email using Resend
    // Important: The "from" address must be verified in your Resend account dashboard!
    const { data, error } = await resend.emails.send({
      from: 'Chocket <onboarding@resend.dev>', // Change to your verified domain e.g. <noreply@chocket.com> in Production
      to: [email],
      subject: 'Verify your Chocket email 🍫✨',
      html: customHtml,
    });

    if (error) {
      console.error("Resend API Email error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Custom email sent!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating email verification link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
