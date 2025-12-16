# Twilio WhatsApp OTP Integration Setup

This app now supports sending OTP codes via Twilio's WhatsApp API.

## Environment Variables

Add these to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
# Twilio WhatsApp API Configuration
TWILIO_ACCOUNT_SID="your-account-sid-here"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
TWILIO_CONTENT_SID="your-content-sid-here"
```

## Configuration

Based on your curl example, you'll need:
- **Account SID**: Your Twilio Account SID (starts with `AC`)
- **From Number**: `whatsapp:+14155238886` (Twilio Sandbox) or your production WhatsApp number
- **Content SID**: Your approved Content Template SID (starts with `HX`)

## Content Template Requirements

Your Twilio Content Template should:
1. Be approved in Twilio Console
2. Support OTP parameter (typically `{{1}}` for the first parameter)
3. Be configured for WhatsApp messaging

### Template Parameters

The code sends the OTP as parameter `"1"` in ContentVariables. If your template uses a different parameter name, update `lib/whatsapp.ts`:

```typescript
const contentVariables = JSON.stringify({
  "1": otpCode, // Change "1" to match your template parameter
});
```

Example template structure:
```
Content Template: [Your Content SID]
Body: "Your verification code is {{1}}"
```

The code will send:
```json
{
  "ContentVariables": "{\"1\":\"123456\"}"
}
```

## Testing

1. **Set environment variables** in `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID="your-account-sid-here"
   TWILIO_AUTH_TOKEN="your-auth-token-here"
   TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
   TWILIO_CONTENT_SID="your-content-sid-here"
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Test OTP sending**:
   - Go to the app
   - Enter a phone number (must be registered in Twilio Sandbox for testing)
   - Check server logs for Twilio send status
   - Check the phone's WhatsApp for the message

## Twilio Sandbox Setup

For testing, you need to:
1. Join the Twilio Sandbox by sending the join code to the sandbox number
2. Add your test phone number to the sandbox
3. Use the sandbox number (`whatsapp:+14155238886`) as the `From` number

For production:
1. Get a Twilio WhatsApp Business number
2. Update `TWILIO_WHATSAPP_FROM` to your production number
3. Create and approve your Content Template in Twilio Console

## Fallback Behavior

- If Twilio is **not configured** (missing env vars): Falls back to mock mode (OTP shown in console/logs)
- If Twilio **sending fails**: Falls back to mock mode
- In **development mode**: Always returns OTP in API response for testing
- In **production with Twilio**: OTP is NOT returned in API response (security)

## Phone Number Format

The app automatically converts phone numbers to WhatsApp format:
- Input: `+96512345678` or `96512345678`
- Twilio format: `whatsapp:+96512345678` (adds `whatsapp:` prefix)

## Troubleshooting

### Error: Authentication failed
- Verify `TWILIO_AUTH_TOKEN` is correct
- Check `TWILIO_ACCOUNT_SID` matches your account
- Ensure credentials are not expired

### Error: Invalid phone number
- For Sandbox: Phone must be registered in Twilio Sandbox
- For Production: Phone must be opted-in to receive WhatsApp messages
- Ensure phone numbers are in international format (with country code)

### Error: Content Template not found
- Verify `TWILIO_CONTENT_SID` matches your approved template
- Check template is approved in Twilio Console
- Ensure template is configured for WhatsApp

### Error: Parameter mismatch
- Check your Content Template parameter names
- Update `lib/whatsapp.ts` to match your template structure
- Verify ContentVariables JSON format is correct

## Production Deployment

1. **Add environment variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all `TWILIO_*` variables
   - Set for Production, Preview, and Development environments

2. **Redeploy** after adding variables

3. **Test in production**:
   - Use a real phone number (must be opted-in)
   - Verify WhatsApp message is received
   - Check server logs for any errors

## Security Notes

- **Never commit** `.env.local` or auth tokens to Git
- **Rotate tokens** regularly
- **Use environment variables** in Vercel, not hardcoded values
- In production, OTP is **never returned** in API responses when Twilio is enabled

## API Reference

Twilio WhatsApp API Documentation:
- https://www.twilio.com/docs/whatsapp/api
- https://www.twilio.com/docs/content-api
