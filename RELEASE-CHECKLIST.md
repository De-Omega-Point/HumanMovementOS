# Market-readiness checklist

## Product
- [x] Client, Trainer and Administrator roles separated.
- [x] 52-week programme engine and workout timer.
- [x] Easier variations and readiness gates.
- [x] Trainer attention queue and local-first coaching intelligence.
- [x] Client onboarding flow.
- [x] Stripe/Supabase architecture present.
- [ ] Final production pricing approved.
- [ ] Production privacy/terms reviewed.

## QA
- [x] Core unit suite passes.
- [x] AI-kit suite passes.
- [ ] Real iPhone Safari test.
- [ ] Real Android Chrome test.
- [ ] Desktop Chrome/Safari/Edge smoke test.
- [ ] Screen-wake/audio behaviour checked on real phones.

## Security
- [ ] Three-account RLS/isolation test on live Supabase project.
- [ ] Trainer-transfer revocation test.
- [ ] Forged Stripe webhook rejection test.
- [ ] Secret scan after production configuration.
- [ ] Backup/restore test with production-shaped data.

## Commercial
- [ ] Stripe TEST checkout round-trip.
- [ ] Customer Portal cancellation/update test.
- [ ] Failed-payment state test.
- [ ] Administrator refund test.
- [ ] Receipt/invoice copy reviewed.

## Launch gate
Do not call the platform production-ready until every unchecked security, billing and real-device item above has passed.
