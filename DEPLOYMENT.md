# Deployment

## Recommended architecture

Static web/PWA frontend + Supabase Auth/Postgres/Edge Functions + Stripe Billing.

## Frontend

Deploy over HTTPS. Replace the repository `config.js` during deployment with public values only:

```js
window.HMO_CONFIG = {
  mode: 'live',
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  appBaseUrl: 'https://YOUR_DOMAIN/'
};
```

Never place service-role or Stripe secret keys here.

## Supabase

Apply `supabase-schema.sql`. For existing environments, apply migrations in chronological order. Deploy functions in `supabase/functions/` and configure their secrets server-side.

## Stripe

Complete `BILLING-SETUP-v0.6.md` in Stripe test mode. Do not enable live prices until checkout, portal, webhook, cancellation, failed-payment and refund tests pass.

## Auth redirects

Add the exact production account/invite redirect URLs to Supabase Auth. Do not use wildcard production redirects unless there is a deliberate reason.

## Cache

`sw.js` caches only same-origin static application assets. Bump the cache version for each release that changes cached assets.
