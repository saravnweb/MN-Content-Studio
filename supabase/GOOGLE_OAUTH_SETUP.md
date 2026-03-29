# Google OAuth Setup

## Step 1 — Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → OAuth consent screen**
   - User type: External
   - App name: MW Content Studio
   - Add your email as test user
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: MW Content Studio
   - **Authorized JavaScript origins** — add (required for Google One Tap):

     ```text
     http://localhost:3000
     https://your-vercel-url.vercel.app
     ```

   - **Authorized redirect URIs** — add BOTH:

     ```text
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     http://localhost:3000/api/auth/callback
     ```

5. Copy the **Client ID** and **Client Secret**

## Step 2 — Supabase Dashboard

1. Go to your Supabase project → **Authentication → Providers**
2. Find **Google** → toggle it ON
3. Paste in the Client ID and Client Secret from Step 1
4. Save

## Step 3 — Supabase Auth Settings

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (dev) or your Vercel URL (prod)
3. Add to **Redirect URLs**:

   ```text
   http://localhost:3000/api/auth/callback
   https://your-vercel-url.vercel.app/api/auth/callback
   ```

## Step 4 — Add Google Client ID to `.env.local`

```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

This is the same Client ID you pasted into Supabase. It enables Google One Tap on the login and signup pages.

## Step 5 — Supabase Realtime (for notification bell)

Run this in the SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

OR go to: **Database → Replication** → enable `notifications` table.

## Step 6 — Run triggers.sql

Paste the contents of `supabase/triggers.sql` into the SQL Editor and run it.

---

After these steps, Google One Tap and the "Continue with Google" button will work on both login and signup pages.
