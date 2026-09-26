# Human Movement OS v0.6 Billing setup

1. Apply `migration-v0.5-to-v0.6-billing.sql` after v0.5.
2. Create products/prices in Stripe TEST mode. Copy each Stripe Price ID into `billing_plans.stripe_price_id`, confirm your real commercial pricing, then set only approved plans `active=true`.
3. Deploy Supabase Edge Functions: `create-checkout-session`, `create-portal-session`, `administrator-refund`, `stripe-webhook`.
4. Set Supabase function secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`. Supabase provides `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never put secret/service keys into browser files.
5. Configure Stripe webhook endpoint to the deployed `stripe-webhook` function. Subscribe at minimum to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`.
6. Test with Stripe test mode only. Confirm: client checkout -> subscription mirror -> trainer status -> admin MRR -> customer portal -> cancellation -> failed payment -> refund.
7. Only after the full test matrix passes should live Stripe keys be configured.

## Role boundaries
- Client: can start Checkout, open their own Customer Portal, read own subscription/payment history.
- Trainer: read-only billing status for assigned clients. No refunds, plan changes or financial operations.
- Administrator: platform-wide subscription/payment visibility and refund action.

## Accounting note
Stripe remains the source of truth for actual money movement. HMO stores a synchronised operational mirror for access control and dashboards.
