# Church website (React + Vite + Tailwind + Supabase)

## Run locally
1. `npm install`
2. `cp .env.example .env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase > Project Settings > API; use the anon key only, never the service-role key).
3. `npm run dev`

## Supabase setup
1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/schema.sql` (tables, RLS policies, five storage buckets and their policies).
3. Auth > URL Configuration: add your site URL and `<site>/admin/reset` as redirect URLs (needed for password reset).
4. Sign-ups: disable public sign-ups under Auth > Providers > Email so only invited users exist.

## First admin
1. Auth > Users > Add user (email + password, auto-confirm).
2. SQL Editor: `update profiles set role='admin' where email='you@example.com';`
3. Log in at `/admin/login`. Further admins can be promoted in Admin > Users.

## Deploy (Vercel / Netlify)
Build `npm run build`, output `dist`. Set both env vars in the host. Add an SPA rewrite: all paths to `/index.html` (Netlify: `/* /index.html 200` in `public/_redirects`; Vercel: rewrite in `vercel.json`).

## Notes
- Giving page records pledges only in `donations`; no card data is stored. Integrate Stripe/Paystack/M-Pesa server-side (Edge Function) later.
- Prayer requests and messages are insert-only for the public; only admins can read them.
