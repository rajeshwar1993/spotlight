# Supabase Setup Guide for Spotlight

This guide will walk you through setting up Supabase for the Spotlight project.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up at https://supabase.com)
- Git repository access

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Click "New project"

2. **Configure Project**
   - **Organization**: Choose or create an organization
   - **Project Name**: `spotlight`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

3. **Wait for Project Creation**
   - This takes 2-3 minutes
   - You'll see a progress indicator

## 🔐 Step 2: Get API Keys

1. **Navigate to API Settings**
   - Go to Settings → API in your project dashboard

2. **Copy Important Values**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Long string starting with `eyJ...` (keep this secret!)

## 📁 Step 3: Configure Environment Variables

1. **Create Environment File**
   ```bash
   cd web-app
   cp .env.local.example .env.local
   ```

2. **Edit .env.local**
   ```bash
   # Replace with your actual values
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Generate a random secret for NextAuth
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   
   # Set your app URLs
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Spotlight
   
   # Storage bucket name
   NEXT_PUBLIC_STORAGE_BUCKET=portfolios
   
   NODE_ENV=development
   ```

## 🗄️ Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - In your Supabase dashboard, go to SQL Editor

2. **Run Migration Files**
   - Copy and paste the content from each migration file in order:
   - `supabase/migrations/01_create_initial_database_schema.sql`
   - `supabase/migrations/02_enable_row_level_security.sql`
   - `supabase/migrations/03_setup_storage_buckets.sql`

3. **Execute Each Migration**
   - Paste the SQL content
   - Click "Run" for each migration
   - Verify no errors occurred

### Option B: Using Supabase CLI (Advanced)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

3. **Push Migrations**
   ```bash
   supabase db push
   ```

## 🔑 Step 5: Configure Authentication

1. **Follow the Auth Setup Guide**
   - Open `supabase/setup-auth-providers.md`
   - Configure Email/Password (already enabled)
   - Set up Google OAuth (recommended)
   - Configure email templates

2. **Set Site URL**
   - Go to Authentication → URL Configuration
   - Set Site URL: `http://localhost:3000` (development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/confirm`

## 🗃️ Step 6: Configure Storage

1. **Verify Storage Buckets**
   - Go to Storage in Supabase dashboard
   - You should see `user-uploads` and `portfolios` buckets
   - If not, run the storage migration again

2. **Configure Bucket Settings**
   - Both buckets should be public
   - File size limit: 50MB
   - Allowed types: image/jpeg, image/png, image/webp, image/gif

## ✅ Step 7: Test Connection

1. **Install Dependencies**
   ```bash
   cd web-app
   npm install
   ```

2. **Run Connection Test**
   ```bash
   npm run test:supabase
   ```

3. **Verify Results**
   - All checks should pass ✅
   - Fix any issues before proceeding

## 🧪 Step 8: Test the Application

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Application**
   - Visit http://localhost:3000
   - The app should load without errors

3. **Test Basic Features**
   - Try signing up with email
   - Check email for confirmation
   - Test login/logout

## 🔧 Troubleshooting

### Common Issues

#### ❌ Connection Failed
- **Check**: API keys are correct in `.env.local`
- **Check**: Project is active in Supabase dashboard
- **Check**: No typos in environment variables

#### ❌ CORS Errors
- **Check**: Site URL is set correctly
- **Check**: Redirect URLs match exactly

#### ❌ Database Errors
- **Check**: Migrations were run successfully
- **Check**: RLS policies are enabled
- **Check**: Tables exist in database

#### ❌ Authentication Issues
- **Check**: Email confirmation is configured
- **Check**: OAuth providers are set up correctly
- **Check**: Environment variables include auth secrets

### Get Help

1. **Check Supabase Docs**: https://supabase.com/docs
2. **Check Application Logs**: Use browser dev tools
3. **Check Supabase Logs**: Go to Logs in Supabase dashboard
4. **Run Test Script**: `npm run test:supabase` for diagnostics

## 📝 Next Steps

After successful setup:

1. ✅ Supabase project created and configured
2. ✅ Database schema migrated
3. ✅ Authentication configured
4. ✅ Storage buckets set up
5. ✅ Connection tested

You're now ready to proceed with **Part 0.3: Development Tools** or start building the application features!

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep service_role key secret and secure
- Use environment-specific configurations for production
- Enable RLS policies for all tables
- Regularly rotate API keys in production