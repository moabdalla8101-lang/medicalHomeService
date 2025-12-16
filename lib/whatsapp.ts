/**
 * Twilio WhatsApp API Integration
 * Sends OTP messages via Twilio's WhatsApp API
 */

interface TwilioMessageResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body?: string;
  error_code?: string;
  error_message?: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID;
const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

/**
 * Send OTP via Twilio WhatsApp using Content Template
 */
export async function sendOTPViaWhatsApp(
  phoneNumber: string,
  otpCode: string
): Promise<boolean> {
  if (!TWILIO_AUTH_TOKEN || !TWILIO_ACCOUNT_SID || !TWILIO_WHATSAPP_FROM || !TWILIO_CONTENT_SID) {
    console.error('[TWILIO] Twilio configuration incomplete');
    return false;
  }

  // Convert phone to WhatsApp format (ensure it starts with whatsapp:)
  let whatsappPhone = phoneNumber;
  if (!whatsappPhone.startsWith('whatsapp:')) {
    // Ensure phone has + prefix
    if (!whatsappPhone.startsWith('+')) {
      whatsappPhone = '+' + whatsappPhone;
    }
    whatsappPhone = 'whatsapp:' + whatsappPhone;
  }

  try {
    // Create Basic Auth header (Account SID:Auth Token)
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    // Prepare ContentVariables - adjust parameter name based on your template
    // If your template uses {{1}} for OTP, use "1" as the key
    const contentVariables = JSON.stringify({
      "1": otpCode, // Adjust this if your template uses different parameter names
    });

    // Create form data
    const formData = new URLSearchParams();
    formData.append('To', whatsappPhone);
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('ContentSid', TWILIO_CONTENT_SID);
    formData.append('ContentVariables', contentVariables);

    const response = await fetch(TWILIO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[TWILIO] Error sending message:', {
        error: data.message || 'Unknown error',
        code: data.code,
        status: data.status,
        phone: whatsappPhone,
      });
      return false;
    }

    const result = data as TwilioMessageResponse;
    console.log('[TWILIO] Message sent successfully:', {
      messageSid: result.sid,
      status: result.status,
      phone: whatsappPhone,
    });

    return true;
  } catch (error: any) {
    console.error('[TWILIO] Exception sending message:', {
      error: error.message,
      phone: whatsappPhone,
    });
    return false;
  }
}

/**
 * Verify if Twilio WhatsApp is properly configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    TWILIO_AUTH_TOKEN &&
    TWILIO_ACCOUNT_SID &&
    TWILIO_WHATSAPP_FROM &&
    TWILIO_CONTENT_SID
  );
}
