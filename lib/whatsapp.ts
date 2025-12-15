/**
 * WhatsApp Cloud API Integration
 * Sends OTP messages via Meta's WhatsApp Cloud API
 */

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '886251584573678';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Send OTP via WhatsApp using template message
 */
export async function sendOTPViaWhatsApp(
  phoneNumber: string,
  otpCode: string
): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.error('[WHATSAPP] Access token not configured');
    return false;
  }

  // Convert phone to WhatsApp format (remove + if present, ensure it's just digits with country code)
  const whatsappPhone = phoneNumber.startsWith('+') 
    ? phoneNumber.substring(1) 
    : phoneNumber;

  try {
    // Option 1: Use template message (if you have an approved template)
    const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'jaspers_market_plain_text_v1';
    const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'ar'; // Arabic

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          // Include OTP as template parameter
          // Adjust this based on your template structure
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otpCode,
                },
              ],
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as WhatsAppErrorResponse;
      console.error('[WHATSAPP] Error sending message:', {
        error: error.error?.message || 'Unknown error',
        code: error.error?.code,
        type: error.error?.type,
        phone: whatsappPhone,
      });
      
      // If template doesn't exist or has wrong parameters, try text message
      if (error.error?.code === 132000 || error.error?.code === 100) {
        console.log('[WHATSAPP] Template error, trying text message instead...');
        return await sendOTPViaWhatsAppText(phoneNumber, otpCode);
      }
      
      return false;
    }

    const result = data as WhatsAppMessageResponse;
    console.log('[WHATSAPP] Message sent successfully:', {
      messageId: result.messages?.[0]?.id,
      phone: whatsappPhone,
    });

    return true;
  } catch (error: any) {
    console.error('[WHATSAPP] Exception sending message:', {
      error: error.message,
      phone: whatsappPhone,
    });
    return false;
  }
}

/**
 * Send OTP via WhatsApp using simple text message (fallback)
 * Note: This requires the recipient to have messaged you first (24-hour window)
 * For production, use approved templates instead
 */
async function sendOTPViaWhatsAppText(
  phoneNumber: string,
  otpCode: string
): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    return false;
  }

  const whatsappPhone = phoneNumber.startsWith('+') 
    ? phoneNumber.substring(1) 
    : phoneNumber;

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappPhone,
        type: 'text',
        text: {
          body: `رمز التحقق الخاص بك هو: ${otpCode}\n\nYour verification code is: ${otpCode}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as WhatsAppErrorResponse;
      console.error('[WHATSAPP] Error sending text message:', {
        error: error.error?.message || 'Unknown error',
        code: error.error?.code,
        phone: whatsappPhone,
      });
      return false;
    }

    console.log('[WHATSAPP] Text message sent successfully');
    return true;
  } catch (error: any) {
    console.error('[WHATSAPP] Exception sending text message:', error.message);
    return false;
  }
}

/**
 * Verify if WhatsApp is properly configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_PHONE_NUMBER_ID
  );
}
