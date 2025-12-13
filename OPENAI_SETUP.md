# OpenAI API Setup Guide

## Error: 429 Quota Exceeded

If you're getting a "429 You exceeded your current quota" error, here's how to fix it:

### Step 1: Check Your OpenAI Account

1. Go to https://platform.openai.com/account/billing
2. Sign in with the account associated with your API key
3. Check:
   - **Account Balance**: Should show available credits
   - **Payment Method**: Should be added and verified
   - **Usage Limits**: Check if you have any spending limits set

### Step 2: Verify Your API Key

1. Go to https://platform.openai.com/api-keys
2. Verify the API key in your `.env.local` matches one of your keys
3. Check if the key is active (not revoked)

### Step 3: Add Credits/Billing

If your account has $0 balance:

1. Go to https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Add a credit card or other payment method
4. Add credits to your account (minimum is usually $5)

### Step 4: Check API Key Format

Your API key should:
- Start with `sk-proj-` (for new keys) or `sk-` (for older keys)
- Be about 50-60 characters long
- Not have any spaces or extra characters

### Step 5: Verify the Key Works

You can test your API key with this command:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

If it returns a list of models, your key is valid.

### Common Issues

**Issue**: "No usage showing on dashboard"
- **Solution**: Usage might take a few minutes to appear. Also check if you're looking at the right account.

**Issue**: "Key works but getting 429 errors"
- **Solution**: Your account likely has $0 balance. Add credits via billing page.

**Issue**: "Key is invalid"
- **Solution**: Generate a new API key at https://platform.openai.com/api-keys

### Temporary Workaround

While you fix the OpenAI issue, you can:
1. Use the **Manual Entry** option (no AI needed)
2. The app will still show comparison results using sample data

### Need Help?

- OpenAI Support: https://help.openai.com/
- Check your account: https://platform.openai.com/account
- API Status: https://status.openai.com/

