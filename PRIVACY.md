# Privacy design

Human Movement OS follows a data-minimisation approach.

## Intended data

The platform may process account identity, trainer-client relationships, programme assignments, workout results, adherence, RPE, onboarding/readiness responses, trainer notes and billing status. Payment-card details are handled by Stripe and should not be stored by Human Movement OS.

## Design rules

- Collect only data needed for coaching and platform operations.
- Treat workout/readiness information as sensitive personal information.
- Keep each Client isolated from other Clients.
- Give Trainers access only to assigned Clients.
- Restrict platform-wide access to Administrators.
- Keep local exports private; they can contain personal training information.
- Do not send Client information to external AI services unless a future feature has an explicit privacy design and user-facing disclosure.

## Before public launch

Confirm the production privacy notice, retention periods, deletion/export process, breach-response process and Australian privacy-law obligations with qualified legal/privacy advice.
