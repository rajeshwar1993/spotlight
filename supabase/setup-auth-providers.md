# Authentication Providers Setup Guide

This guide will help you configure authentication providers in your Supabase project.

## Required Authentication Providers

### 1. Email/Password Authentication (Built-in)
✅ **Already enabled by default** - No additional configuration needed.

### 2. Google OAuth (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
7. Copy Client ID and Client Secret
8. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Click Save

### 3. GitHub OAuth (Optional)
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: "Spotlight"
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Paste Client ID and Client Secret
   - Click Save

## Email Templates Configuration

### 1. Confirm Email Template
Go to Supabase Dashboard → Authentication → Email Templates → Confirm signup

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
```

### 2. Reset Password Template
Go to Supabase Dashboard → Authentication → Email Templates → Reset password

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 3. Magic Link Template
Go to Supabase Dashboard → Authentication → Email Templates → Magic Link

```html
<h2>Your Magic Link</h2>
<p>Follow this link to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
```

## URL Configuration

### Site URL
Set your site URL in Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-domain.com` (production) or `http://localhost:3000` (development)

### Redirect URLs
Add these redirect URLs:
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback`
- `https://your-domain.com/auth/confirm`
- `http://localhost:3000/auth/confirm`

## Security Settings

### 1. Enable Email Confirmation
- Go to Authentication → Settings
- Enable "Enable email confirmations"
- Set "Email confirmation" to "Enabled"

### 2. Password Requirements
- Minimum password length: 8 characters
- Require lowercase: Yes
- Require uppercase: Yes
- Require numbers: Yes
- Require symbols: Optional

### 3. Session Settings
- JWT expiry: 3600 seconds (1 hour)
- Refresh token expiry: 604800 seconds (7 days)

## Testing Authentication

After setup, test the authentication flow:
1. Try signing up with email/password
2. Check email for confirmation link
3. Test Google OAuth flow
4. Test password reset flow

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Common Issues

### 1. Redirect URI Mismatch
- Ensure redirect URIs match exactly in OAuth provider settings
- Include both production and development URLs

### 2. Email Not Sending
- Check email provider settings
- Verify SMTP configuration if using custom email provider

### 3. CORS Issues
- Ensure site URL is correctly configured
- Check that redirect URLs are whitelisted