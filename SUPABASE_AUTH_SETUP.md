# Supabase Authentication Configuration Guide

## Important: Port Configuration

You're currently running on **port 3001**. Make sure to:
1. Update `.env.local`: `NEXT_PUBLIC_APP_URL=http://localhost:3001`
2. OR use the Next.js default port 3000 instead

For this guide, I'll use **port 3001** since that's what you're testing with.

## 1. Configure Redirect URLs in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/ttpgykxgpveqwkosejzd
2. Navigate to **Authentication > URL Configuration**
3. Add the following URLs:

### Site URL
```
http://localhost:3001
```

### Redirect URLs (add all of these)
```
http://localhost:3001
http://localhost:3001/auth/callback
http://localhost:3001/**
```

## 2. Enable Authentication Providers

### Magic Link (Email) - Already Enabled by Default
Magic Link is already configured in the login page. Users can sign in by email without a password.

### Google OAuth (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication > Providers**
2. Click on **Google**
3. Toggle **Enable Sign in with Google** to ON

#### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add authorized redirect URI:
   ```
   https://ttpgykxgpveqwkosejzd.supabase.co/auth/v1/callback
   ```
8. Copy the **Client ID** and **Client Secret**
9. Paste them in Supabase Google provider settings
10. Click **Save**

## 3. Test Authentication

### Test Magic Link:
1. Start your dev server: `npm run dev`
2. Go to http://localhost:3001/login
3. Enter your email address
4. Click "Send magic link"
5. Check your email for the magic link
6. Click the link to sign in

### Test Google OAuth:
1. Go to http://localhost:3001/login
2. Click "Sign in with Google"
3. Authorize the app
4. You'll be redirected back and signed in

## 4. For Production (Vercel)

When you deploy to Vercel, update these settings:

### In Supabase:
1. Add your Vercel URL to Site URL:
   ```
   https://your-app.vercel.app
   ```

2. Add Vercel URLs to Redirect URLs:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

3. Update Google OAuth authorized redirect URI:
   ```
   https://ttpgykxgpveqwkosejzd.supabase.co/auth/v1/callback
   ```
   (This stays the same)

### In Vercel:
Add environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

## Current Status

✅ Magic Link email authentication is configured
✅ Email/password authentication works
⏳ Google OAuth needs credentials from Google Cloud Console

## Testing Checklist

- [ ] Configure Supabase redirect URLs
- [ ] Test Magic Link sign in
- [ ] (Optional) Set up Google OAuth
- [ ] Test sign out
- [ ] Test protected routes redirect to login
- [ ] Test recipe extraction with real user
- [ ] Test recipe saving with real user

## Troubleshooting

### "Invalid Redirect URL" error
Make sure you added the exact redirect URL in Supabase dashboard under Authentication > URL Configuration.

### Magic link not working
1. Check spam folder
2. Make sure email is configured in Supabase (Authentication > Email Templates)
3. Check Supabase logs for errors

### Google OAuth not working
1. Verify Client ID and Secret are correct
2. Check authorized redirect URIs in Google Cloud Console
3. Make sure Supabase callback URL is added to Google OAuth settings
