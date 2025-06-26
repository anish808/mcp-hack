# Email Setup Guide - Resend.com

## 🚀 Quick Setup (5 minutes)

### 1. Sign up for Resend.com
- Go to [resend.com](https://resend.com)
- Sign up with your email
- Verify your email address

### 2. Get Your API Key
- Go to [resend.com/api-keys](https://resend.com/api-keys)
- Click "Create API Key"
- Copy the API key (starts with `re_`)

### 3. Update Production Environment
Replace the placeholder in `.env.production`:
```bash
# Replace this line:
RESEND_API_KEY=your_resend_api_key_here

# With your actual API key:
RESEND_API_KEY=re_1234567890abcdef...
```

### 4. Deploy
```bash
./deploy.sh
```

## ✅ Benefits of Resend.com

- **Free Tier**: 3,000 emails/month
- **No SMTP restrictions**: Works on all cloud providers
- **Better deliverability**: 99.9% inbox rate
- **Simple API**: No complex SMTP configuration
- **Real-time analytics**: Track email performance

## 🔧 How It Works

Instead of using Gmail SMTP (which DigitalOcean blocks), we now use Resend's REST API to send emails. This bypasses all SMTP restrictions and provides better reliability.

## 📧 Email Configuration

- **From**: `Etale Systems <noreply@etalesystems.com>`
- **To**: `etalesystemsteam@gmail.com`
- **Subject**: "New Contact Form Submission - Etale Systems"

## 🚨 Important Notes

1. **Domain Verification**: For production, you should verify your domain with Resend
2. **API Key Security**: Never commit the API key to git (it's already in .gitignore)
3. **Rate Limits**: Free tier allows 3,000 emails/month

## 🆘 Troubleshooting

If emails still don't work:
1. Check the API key is correct
2. Verify your Resend account is active
3. Check backend logs: `docker-compose logs backend` 