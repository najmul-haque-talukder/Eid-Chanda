# 🚀 Deployment Checklist for Eid Chanda

Follow these steps to deploy your application to Vercel/Production.

### 1. Supabase Setup
- Go to [Supabase Dashboard](https://supabase.com).
- **SQL Editor**: Copy the contents of `supabase/schema.sql` and run them. This creates the tables, RLS policies, and triggers.
- **Auth Settings**: 
  - Enable **Google** provider in Authentication → Providers.
  - Add your Google Client ID and Secret (if using custom credentials).
  - Add `https://your-app.vercel.app/auth/callback` to the **Redirect URLs** in Authentication → Settings.

### 2. Environment Variables
Add these to your Vercel Project Settings (Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon/Public API key.
- `NEXT_PUBLIC_APP_URL`: (Optional) Your production URL like `https://digitalkham.vercel.app`.

### 3. Vercel Deployment
- Import your repository.
- Next.js framework will be auto-detected.
- Click **Deploy**.

### 4. Image Optimization
The app uses images from Google and Supabase. `next.config.ts` is already configured to allow these hostnames. If you use a different Supabase project, make sure to update `next.config.ts` image hostnames if they differ.

---
**Build Status**: Locally verified (Success ✅)
