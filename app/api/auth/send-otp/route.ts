import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, isValidKuwaitPhone, normalizePhone, generateOTP } from '@/lib/auth';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const sendOTPSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['user', 'provider', 'admin', 'medical_centre']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role } = sendOTPSchema.parse(body);
    
    const normalizedPhone = normalizePhone(phone);
    
    if (!isValidKuwaitPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a valid Kuwait phone number (+965XXXXXXXX)' },
        { status: 400 }
      );
    }
    
    // Generate and send OTP (currently hardcoded to '123456' for testing)
    const otp = generateOTP();
    await sendOTP(normalizedPhone, otp);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('OTP sent:', {
        originalPhone: phone,
        normalizedPhone,
        otp,
      });
    }
    
    // Check if WhatsApp is configured
    let whatsappEnabled = false;
    try {
      const { isWhatsAppConfigured } = await import('@/lib/whatsapp');
      whatsappEnabled = isWhatsAppConfigured();
    } catch (error) {
      // WhatsApp module not available or error
      console.warn('[OTP] Could not check WhatsApp configuration');
    }
    
    // Return response
    // In development, include OTP for testing
    // In production with WhatsApp, OTP is sent via WhatsApp and not returned
    const response: any = {
      success: true,
      message: whatsappEnabled ? 'تم إرسال رمز التحقق عبر واتساب' : 'OTP sent successfully',
      normalizedPhone, // Always return normalized phone so client can use it
    };
    
    // Only return OTP in development mode or if WhatsApp is not configured
    if (process.env.NODE_ENV === 'development' || !whatsappEnabled) {
      response.otp = otp; // Include OTP for testing
    }
    
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

