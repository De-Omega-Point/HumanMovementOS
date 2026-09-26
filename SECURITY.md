# Security

## Security model

Human Movement OS uses three roles: `client`, `trainer`, and `administrator`. Browser code must never be trusted to grant or elevate roles.

### Mandatory controls

- Supabase Row Level Security must remain enabled on user and coaching tables.
- Role changes must use administrator-only server/database functions.
- Stripe is the source of truth for payment state.
- Billing tables are read-only to ordinary browser clients except through approved server-side functions.
- Invite tokens are stored as hashes, not raw tokens.
- Production requires HTTPS.
- Service-role keys, Stripe secret keys and webhook secrets must never be committed.

## Production acceptance tests

Before onboarding clients, verify with three separate accounts/browsers:

1. A Client cannot read another Client's records.
2. A Trainer sees only assigned Clients.
3. An Administrator can transfer a Client between Trainers.
4. The former Trainer loses access immediately after transfer.
5. A Client cannot promote their own role.
6. Billing changes arrive through verified Stripe webhooks.
7. A forged webhook is rejected.

## Reporting

Do not open a public issue containing credentials, personal information or exploitable security details. Use the repository owner's private security contact/channel.
