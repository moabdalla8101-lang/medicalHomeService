# WhatsApp OTP Integration Setup

This app now supports sending OTP codes via Meta's WhatsApp Cloud API.

## Environment Variables

Add these to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN="your-access-token-here"
WHATSAPP_PHONE_NUMBER_ID="886251584573678"
WHATSAPP_API_VERSION="v22.0"
WHATSAPP_OTP_TEMPLATE_NAME="jaspers_market_plain_text_v1"
WHATSAPP_TEMPLATE_LANGUAGE="ar"
```

## Current Configuration

Based on your curl example:
- **Phone Number ID**: `886251584573678`
- **API Version**: `v22.0`
- **Template Name**: `jaspers_market_plain_text_v1`
- **Language**: Currently set to `ar` (Arabic) - change if your template uses different language

## Template Requirements

Your WhatsApp template should:
1. Be approved by Meta
2. Support OTP parameter (if using parameterized template)
3. Be in the language specified by `WHATSAPP_TEMPLATE_LANGUAGE`

### Template Parameters

If your template accepts the OTP as a parameter, the code will automatically include it in the `components.body.parameters` array.

Example template structure:
```
Template Name: jaspers_market_plain_text_v1
Body: "Your verification code is {{1}}"
```

The code will send:
```json
{
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "123456"
        }
      ]
    }
  ]
}
```

## Testing

1. **Set environment variables** in `.env.local`:
   ```env
   WHATSAPP_ACCESS_TOKEN="EAAhJYC1el0oBQBZBW4k2e81KZBUT1wVcAwWfsBZBPNpxZCNPdZBHyo7DF5tTUEdAQNfVD2BnntMiZAb1ZAZB1hTTaWpokq3USgc4WtKeBTTZCLOLRBNoq8aAgsaDeXzggylwL3pZCzvZAnqJKpkjQdTITZBBuMB1X64qTtp6aZCxPx7tVUtYdXhdQajvOZB5sT6fyRZARjdSwAY6cBRQmFUoYdI70M9BcO0CW9VPPLK8J1BBxLlqjYDU5TVhfpBrAJrkBy9jRy3ZBR1fvPQpsZAQ3D6yFFNuwkdYbvE54WPkZD"
   WHATSAPP_PHONE_NUMBER_ID="886251584573678"
   WHATSAPP_API_VERSION="v22.0"
   WHATSAPP_OTP_TEMPLATE_NAME="jaspers_market_plain_text_v1"
   WHATSAPP_TEMPLATE_LANGUAGE="ar"
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Test OTP sending**:
   - Go to the app
   - Enter a Kuwait phone number (e.g., `12345678`)
   - Check server logs for WhatsApp send status
   - Check the phone's WhatsApp for the message

## Fallback Behavior

- If WhatsApp is **not configured** (missing env vars): Falls back to mock mode (OTP shown in console/logs)
- If WhatsApp **sending fails**: Falls back to mock mode
- In **development mode**: Always returns OTP in API response for testing
- In **production with WhatsApp**: OTP is NOT returned in API response (security)

## Phone Number Format

The app automatically converts Kuwait phone numbers to WhatsApp format:
- Input: `+96512345678` or `12345678`
- WhatsApp format: `96512345678` (removes `+` prefix)

## Troubleshooting

### Error: Template not found
- Check `WHATSAPP_OTP_TEMPLATE_NAME` matches your approved template name exactly
- Verify template is approved in Meta Business Manager

### Error: Invalid phone number
- Ensure phone numbers are in international format (with country code)
- Kuwait numbers should be `+965XXXXXXXX`

### Error: Authentication failed
- Verify `WHATSAPP_ACCESS_TOKEN` is valid and not expired
- Check token has `whatsapp_business_messaging` permission

### Template parameter errors
- If your template doesn't use parameters, comment out the `components` section in `lib/whatsapp.ts`
- If your template uses different parameter structure, adjust the `components` array

## Production Deployment

1. **Add environment variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all `WHATSAPP_*` variables
   - Set for Production, Preview, and Development environments

2. **Redeploy** after adding variables

3. **Test in production**:
   - Use a real phone number
   - Verify WhatsApp message is received
   - Check server logs for any errors

## Security Notes

- **Never commit** `.env.local` or access tokens to Git
- **Rotate tokens** regularly
- **Use environment variables** in Vercel, not hardcoded values
- In production, OTP is **never returned** in API responses when WhatsApp is enabled


