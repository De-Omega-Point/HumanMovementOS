# Human Movement OS v1.0 Release QA

## Automated verification

- Core unit suite: **16/16 groups passed**.
- Programme matrix: **1,456 generated session configurations passed**.
- AI-kit suite: **PASS**.
- Secret scan: **0 embedded production Stripe/Supabase secrets detected**.

## Verified design controls

- 52 sequential weeks across four phases.
- Advanced and impact movements are not unlocked by calendar progression alone.
- Easier movement options and readiness gates remain present.
- Timers use wall-clock elapsed time and restore unfinished countdowns.
- AI routing maintains human approval boundaries for coaching actions.

## Production acceptance still required

The following require a real deployment and cannot be truthfully certified from local tests alone:

- Live Supabase three-account RLS/isolation test.
- Stripe TEST checkout/webhook/portal/refund round-trip.
- Real-device iPhone Safari and Android Chrome testing.
- Production privacy/terms/legal review.

See `RELEASE-CHECKLIST.md`.
