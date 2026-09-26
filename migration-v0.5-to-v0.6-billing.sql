-- Human Movement OS v0.6 · Billing & Revenue
-- Apply AFTER v0.5. Stripe remains system-of-record for money; these tables mirror safe operational state.
create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'aud' check (currency = lower(currency)),
  interval text not null default 'month' check (interval in ('month','year')),
  trial_days integer not null default 0 check (trial_days between 0 and 365),
  stripe_price_id text unique,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.billing_customers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.billing_plans(id) on delete set null,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists billing_subscriptions_client_idx on public.billing_subscriptions(client_id);
create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text,
  amount_paid_cents integer not null default 0,
  currency text not null default 'aud',
  status text not null,
  paid_at timestamptz,
  refunded_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists billing_payments_client_idx on public.billing_payments(client_id);
create table if not exists public.billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.billing_plans enable row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_events enable row level security;

-- Plans are visible to signed-in users; only server-side/admin SQL should mutate price IDs.
create policy billing_plans_read on public.billing_plans for select to authenticated using (active or public.current_role()='administrator');
-- Clients see their own subscription, trainers see assigned clients, administrators see all.
create policy billing_subscriptions_read on public.billing_subscriptions for select to authenticated using (
  client_id=auth.uid() or public.current_role()='administrator' or exists(
    select 1 from public.trainer_clients tc where tc.client_id=billing_subscriptions.client_id and tc.trainer_id=auth.uid()
  )
);
create policy billing_payments_read on public.billing_payments for select to authenticated using (
  client_id=auth.uid() or public.current_role()='administrator'
);
-- billing_customers + billing_events deliberately have no browser RLS policies.

revoke all on public.billing_plans, public.billing_customers, public.billing_subscriptions, public.billing_payments, public.billing_events from anon;
revoke all on public.billing_plans, public.billing_customers, public.billing_subscriptions, public.billing_payments, public.billing_events from authenticated;
grant select on public.billing_plans, public.billing_subscriptions, public.billing_payments to authenticated;

-- Draft commercial plans. Add real Stripe Price IDs and set active=true only after confirming pricing.
insert into public.billing_plans(slug,name,description,amount_cents,currency,interval,trial_days,active)
values
 ('coaching','Coaching','Programme + app + monthly review',14900,'aud','month',7,false),
 ('coaching-plus','Coaching Plus','Programme + app + fortnightly review + messaging',24900,'aud','month',7,false),
 ('premium','Premium','High-touch personalised coaching',39900,'aud','month',7,false)
on conflict(slug) do nothing;
