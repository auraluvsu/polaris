# OAuth Setup Guide

This app uses Supabase with Google OAuth for authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be created

## 2. Set Up Google OAuth Provider

1. In your Supabase project, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow the setup instructions:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google+ API
   - Create an OAuth 2.0 credential (Web application)
   - Add authorized redirect URIs:
     - `https://[your-project-id].supabase.co/auth/v1/callback`
     - `http://localhost:8443/auth/v1/callback` (for local development)
   - Copy the Client ID and Client Secret
4. Paste these into the Google provider settings in Supabase

## 3. Configure Environment Variables

1. In your Supabase project, go to **Project Settings** → **API**
2. Copy your:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)
3. Open `.env.local` and update:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 4. Run the Development Server

The dev server should already be running on port 8443. The app will:
- Show a login page if you're not authenticated
- Redirect to Google OAuth when you click "Sign in with Google"
- Display the Polaris app after successful login
- Show a logout button in the top navigation bar

## Features Implemented

✅ Google OAuth authentication via Supabase
✅ Locked landing page that requires login
✅ Session persistence across page refreshes
✅ Logout functionality
✅ Loading state during auth checks
✅ Responsive design for mobile and desktop
