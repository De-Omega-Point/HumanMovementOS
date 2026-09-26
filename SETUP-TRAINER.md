# Human Movement OS Trainer Edition v0.6

## Production setup

1. Create a new Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Copy `config.example.js` to `config.js` and use only the project URL and **publishable/anon** key. Never place a service-role key in browser code.
4. Deploy the folder to HTTPS.
5. In Supabase Auth → URL Configuration, set your deployed Site URL and allow redirects to `account.html` and `invite.html` on that same origin.
6. Sign in once via `account.html` using your trainer email. New users deliberately start as `client`.
7. From the Supabase SQL editor, promote only your account: `update public.profiles set role='trainer' where email='YOUR_EMAIL@example.com';`
8. Open `trainer.html`. The app creates the built-in 52-week template on first live use.
9. Add a client. You receive a secure invitation URL. The database stores only a SHA-256 hash of the invite token.
10. The client must authenticate with the exact invited email before `claim_client_invite()` creates the trainer-client relationship.

## Security gates before real clients

- Confirm HTTPS is active.
- Test Client A cannot read Client B profile, programme or workout rows.
- Test a client cannot change `profiles.role` or `profiles.email`.
- Test expired and wrong-email invite claims fail.
- Keep health/clinical data outside the MVP until explicit consent and data-retention rules are designed.
- Turn on MFA for the trainer account if available in your chosen auth configuration.

## Architecture

`trainer.html` → Supabase Auth/Postgres/RLS ← `index.html`

Client workout history is still kept locally for workout resilience, while a minimal session summary is synced to the trainer database.
