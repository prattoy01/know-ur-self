# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth for the AntiGravity platform.

## Prerequisites

- A Google account 
- A GitHub account
- Your app deployed or running locally

## Part 1: Setting up Google OAuth

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Enter project name: `AntiGravity` (or any name)
4. Click "CREATE"

### Step 3: Enable Google+ API
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### Step 4: Configure OAuth Consent Screen
1. In the left sidebar, click "OAuth consent screen"
2. Select "External" and click "CREATE"
3. Fill in the required information:
   - App name: `AntiGravity`
   - User support email: Your email
   - Developer contact: Your email
4. Click "SAVE AND CONTINUE"
5. Click "SAVE AND CONTINUE" again (skip scopes)
6. Add test users if needed, then "SAVE AND CONTINUE"

### Step 5: Create OAuth Credentials
1. In the left sidebar, click "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `AntiGravity Web Client`
5. Authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - `https://your-production-domain.com` (for production)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Click "CREATE"

### Step 6: Copy Credentials
1. Copy the **Client ID** and **Client Secret**
2. Add them to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

---

## Part 2: Setting up GitHub OAuth

### Step 1: Go to GitHub Developer Settings
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"

### Step 2: Register Your Application
1. Fill in the application details:
   - **Application name**: `AntiGravity`
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
     - For production: `https://your-production-domain.com/api/auth/callback/github`
2. Click "Register application"

### Step 3: Generate Client Secret
1. After registration, you'll see your **Client ID**
2. Click "Generate a new client secret"
3. Copy both the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables
Add to your `.env` file:
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Part 3: Configure NextAuth

Add these additional required environment variables to your `.env`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# For production:
# NEXTAUTH_URL=https://your-production-domain.com
```

### Generating NEXTAUTH_SECRET
Run this command to generate a secure random secret:
```bash
openssl rand -base64 32
```

---

## Complete .env Example

Your `.env` file should look like this:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generated-secret-from-openssl

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (if already configured)
RESEND_API_KEY=your-resend-key
```

---

## Testing OAuth

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `/login` or `/register`

3. Click "Sign in with Google" or "Sign up with GitHub"

4. You should be redirected to the OAuth provider and back to your app!

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure your authorized redirect URIs in Google Cloud Console or GitHub exactly match:
  - Local: `http://localhost:3000/api/auth/callback/google` (or `/github`)
  - Production: `https://yourdomain.com/api/auth/callback/google` (or `/github`)

### "Invalid client" error
- Double-check that your Client ID and Client Secret are copied correctly
- Make sure there are no extra spaces in your `.env` file

### OAuth works locally but not in production
- Update authorized origins and redirect URIs to use your production domain
- Make sure `NEXTAUTH_URL` in production `.env` is set to your production URL

---

## Production Deployment

When deploying to Vercel or similar:

1. Add all environment variables in the project settings
2. Update OAuth redirect URIs to use production domain
3. Update `NEXTAUTH_URL` to production URL
4. Redeploy

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check your server logs  
3. Verify all environment variables are set correctly
4. Ensure OAuth apps are configured with correct redirect URIs
