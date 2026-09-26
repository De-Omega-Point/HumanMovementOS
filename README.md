# Human Movement OS

**Human Movement OS** is De-Omega-Point's trainer-client movement platform for structured strength, mobility, flexibility, tendon, bone and skill training.

## Release status

This repository contains the **v1.1 release candidate**. Core programme generation and the local AI kit are tested; live Supabase and Stripe acceptance testing is still required before taking real payments or onboarding production clients.

## Three roles

- **Client**: assigned training, timers, set logging, progress, onboarding and billing self-service.
- **Trainer**: assigned-client management, programme control, adherence, notes and coaching intelligence.
- **Administrator**: platform-wide users, relationships, billing operations and operational oversight.

## AI kit

The coaching intelligence layer is local-first:

- `omega-runtime.js` — permissions, orchestration, audit and human-approval gates.
- `brain.js` — deterministic coaching signals and trend scoring.
- `transformers.js` — local language interpretation with deterministic fallback.

AI may summarise and surface patterns. It does not diagnose, medically clear a client, change user roles or silently rewrite a training programme.

## Quick start

1. Serve this directory over HTTPS or localhost. Do not run production from `file://`.
2. Copy `config.example.js` to your deployment-time `config.js` and set only the public Supabase values.
3. Apply `supabase-schema.sql`, then the migrations in order if upgrading an existing environment.
4. Deploy the Supabase Edge Functions under `supabase/functions/`.
5. Configure Stripe in **test mode** first.
6. Run `npm test`.
7. Complete the acceptance checks in `RELEASE-CHECKLIST.md` before enabling live clients.

## Configuration

Never expose a Supabase service-role key, Stripe secret key or webhook secret in browser code. The browser may contain only public/publishable values. Server secrets belong in Supabase Function secrets.

## Product boundaries

Human Movement OS is a coaching and exercise-management product, not a diagnostic device or medical-clearance service. Advanced skills, impact and inversion remain progression-gated and require appropriate judgement.

## Documentation

- `DEPLOYMENT.md`
- `SECURITY.md`
- `PRIVACY.md`
- `RELEASE-CHECKLIST.md`
- `BILLING-SETUP-v0.6.md`
- `QA-v0.8.md`

Copyright © De-Omega-Point. All rights reserved.


## v1.1 administrator hardening

Managed clients are restricted to Today, Timer and Progress. Administrators gain account suspension/reactivation, trainer transfer, onboarding/programme reset, invite revocation, archive, permanent client deletion with subscription guard, and an audit trail.
