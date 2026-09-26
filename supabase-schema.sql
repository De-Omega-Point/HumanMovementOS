-- Human Movement OS · Trainer Edition v0.5
-- Multi-user foundation: Auth + trainer/client invites + assignments + workout summaries.
-- Run in a NEW Supabase project after review.
-- No service-role key belongs in browser code.

create extension if not exists pgcrypto;

do $$ begin create type public.app_role as enum ('administrator','trainer','client'); exception when duplicate_object then null; end $$;
do $$ begin create type public.client_status as enum ('trial','active','paused','archived'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  email text,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  status public.client_status not null default 'trial',
  goal text,
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique(trainer_id, client_id)
);

create table if not exists public.program_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  duration_weeks int not null check (duration_weeks between 1 and 104),
  source_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_programs (
  id uuid primary key default gen_random_uuid(),
  trainer_client_id uuid not null references public.trainer_clients(id) on delete cascade,
  template_id uuid not null references public.program_templates(id),
  start_date date not null default current_date,
  current_week int not null default 1 check (current_week between 1 and 104),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists one_active_program_per_client on public.client_programs(trainer_client_id) where is_active;

create table if not exists public.trainer_notes (
  id uuid primary key default gen_random_uuid(),
  trainer_client_id uuid not null references public.trainer_clients(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  note text not null check (char_length(note) <= 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.workout_summaries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  trainer_client_id uuid references public.trainer_clients(id) on delete set null,
  programme_week int check (programme_week between 1 and 104),
  session_key text,
  session_title text,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  duration_seconds int check (duration_seconds >= 0),
  completed_sets int not null default 0 check (completed_sets >= 0),
  planned_sets int not null default 0 check (planned_sets >= 0),
  perceived_effort int check (perceived_effort between 1 and 10)
);

create table if not exists public.client_invites (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  display_name text not null,
  goal text,
  template_id uuid references public.program_templates(id) on delete set null,
  start_date date not null default current_date,
  token_hash bytea not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  claimed_at timestamptz,
  client_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path=public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, role, email, display_name)
  values(new.id, 'client', lower(new.email), coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do update set email=excluded.email;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.trainer_clients enable row level security;
alter table public.program_templates enable row level security;
alter table public.client_programs enable row level security;
alter table public.trainer_notes enable row level security;
alter table public.workout_summaries enable row level security;
alter table public.client_invites enable row level security;

-- Profiles. Browser users may update display_name only (grant below), never role/email.
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_assigned_read on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_read on public.profiles for select using (id=auth.uid());
create policy profiles_admin_read on public.profiles for select using (public.current_role()='administrator');
create policy profiles_assigned_read on public.profiles for select using (
  exists(select 1 from public.trainer_clients tc where (tc.trainer_id=auth.uid() and tc.client_id=profiles.id) or (tc.client_id=auth.uid() and tc.trainer_id=profiles.id))
);
create policy profiles_self_update on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());
revoke update on public.profiles from authenticated;
grant update(display_name) on public.profiles to authenticated;

-- Relationships.
drop policy if exists tc_participant_read on public.trainer_clients;
drop policy if exists tc_trainer_insert on public.trainer_clients;
drop policy if exists tc_trainer_update on public.trainer_clients;
create policy tc_participant_read on public.trainer_clients for select using (trainer_id=auth.uid() or client_id=auth.uid() or public.current_role()='administrator');
create policy tc_trainer_update on public.trainer_clients for update using (trainer_id=auth.uid() or public.current_role()='administrator') with check (trainer_id=auth.uid() or public.current_role()='administrator');

-- Templates.
drop policy if exists templates_owner_all on public.program_templates;
drop policy if exists templates_assigned_client_read on public.program_templates;
create policy templates_owner_all on public.program_templates for all using (owner_id=auth.uid() or public.current_role()='administrator') with check (owner_id=auth.uid() or public.current_role()='administrator');
create policy templates_assigned_client_read on public.program_templates for select using (
  exists(select 1 from public.client_programs cp join public.trainer_clients tc on tc.id=cp.trainer_client_id where cp.template_id=program_templates.id and tc.client_id=auth.uid())
);

-- Client programme.
drop policy if exists client_program_participant_read on public.client_programs;
drop policy if exists client_program_trainer_manage on public.client_programs;
create policy client_program_participant_read on public.client_programs for select using (
  exists(select 1 from public.trainer_clients tc where tc.id=client_programs.trainer_client_id and (tc.trainer_id=auth.uid() or tc.client_id=auth.uid())) or public.current_role()='administrator'
);
create policy client_program_trainer_manage on public.client_programs for all using (
  exists(select 1 from public.trainer_clients tc where tc.id=client_programs.trainer_client_id and tc.trainer_id=auth.uid()) or public.current_role()='administrator'
) with check (
  exists(select 1 from public.trainer_clients tc where tc.id=client_programs.trainer_client_id and tc.trainer_id=auth.uid()) or public.current_role()='administrator'
);

-- Notes remain trainer-only.
drop policy if exists trainer_notes_trainer_manage on public.trainer_notes;
create policy trainer_notes_trainer_manage on public.trainer_notes for all using (trainer_id=auth.uid() or public.current_role()='administrator') with check (trainer_id=auth.uid() or public.current_role()='administrator');

-- Workout summaries.
drop policy if exists workout_client_write on public.workout_summaries;
drop policy if exists workout_client_read on public.workout_summaries;
drop policy if exists workout_trainer_read on public.workout_summaries;
create policy workout_client_write on public.workout_summaries for insert with check (client_id=auth.uid());
create policy workout_client_read on public.workout_summaries for select using (client_id=auth.uid());
create policy workout_trainer_read on public.workout_summaries for select using (
  exists(select 1 from public.trainer_clients tc where tc.client_id=workout_summaries.client_id and tc.trainer_id=auth.uid()) or public.current_role()='administrator'
);

-- Trainer can see their unclaimed/claimed invites; claims happen only through RPC below.
create policy invite_trainer_read on public.client_invites for select using (trainer_id=auth.uid() or public.current_role()='administrator');

-- Server-side invite creator. Returns raw token once; only hash is stored.
create or replace function public.create_client_invite(
  p_email text, p_display_name text, p_goal text default null,
  p_template_id uuid default null, p_start_date date default current_date
) returns text language plpgsql security definer set search_path=public as $$
declare v_token text := gen_random_uuid()::text; v_uid uuid := auth.uid();
begin
  if v_uid is null or public.current_role() not in ('trainer','administrator') then raise exception 'trainer_required'; end if;
  if p_template_id is not null and not exists(select 1 from public.program_templates where id=p_template_id and (owner_id=v_uid or public.current_role()='administrator')) then raise exception 'invalid_template'; end if;
  insert into public.client_invites(trainer_id,email,display_name,goal,template_id,start_date,token_hash)
  values(v_uid,lower(trim(p_email)),left(trim(p_display_name),120),nullif(left(trim(coalesce(p_goal,'')),500),''),p_template_id,p_start_date,digest(v_token,'sha256'));
  return v_token;
end; $$;

-- Client claims after authenticating with the SAME email address as the invite.
create or replace function public.claim_client_invite(p_token text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_inv public.client_invites%rowtype; v_uid uuid:=auth.uid(); v_email text; v_tc uuid;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  select lower(email) into v_email from auth.users where id=v_uid;
  select * into v_inv from public.client_invites where token_hash=digest(p_token,'sha256') for update;
  if not found then raise exception 'invalid_invite'; end if;
  if v_inv.claimed_at is not null and v_inv.client_id<>v_uid then raise exception 'invite_already_claimed'; end if;
  if v_inv.expires_at < now() then raise exception 'invite_expired'; end if;
  if lower(v_inv.email)<>v_email then raise exception 'email_mismatch'; end if;

  update public.profiles set display_name=coalesce(nullif(v_inv.display_name,''),display_name), updated_at=now() where id=v_uid;
  insert into public.trainer_clients(trainer_id,client_id,status,goal,start_date)
  values(v_inv.trainer_id,v_uid,'trial',v_inv.goal,v_inv.start_date)
  on conflict(trainer_id,client_id) do update set goal=excluded.goal,start_date=excluded.start_date
  returning id into v_tc;

  if v_inv.template_id is not null and not exists(select 1 from public.client_programs where trainer_client_id=v_tc and is_active) then
    insert into public.client_programs(trainer_client_id,template_id,start_date,current_week,is_active)
    values(v_tc,v_inv.template_id,v_inv.start_date,1,true);
  end if;

  update public.client_invites set claimed_at=now(),client_id=v_uid where id=v_inv.id;
  return v_tc;
end; $$;

grant execute on function public.create_client_invite(text,text,text,uuid,date) to authenticated;
grant execute on function public.claim_client_invite(text) to authenticated;

-- Bootstrap helper: run manually in SQL editor AFTER your trainer account signs up.
-- update public.profiles set role='trainer' where email='YOUR_EMAIL@example.com';

-- Creates the built-in 52-week programme template for the signed-in trainer on first use.
create or replace function public.ensure_default_hmo_template()
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_uid uuid:=auth.uid();
begin
  if v_uid is null or public.current_role() not in ('trainer','administrator') then raise exception 'trainer_required'; end if;
  select id into v_id from public.program_templates where owner_id=v_uid and source_key='hmo52' limit 1;
  if v_id is null then
    insert into public.program_templates(owner_id,name,description,duration_weeks,source_key)
    values(v_uid,'Human Movement OS · 52 Week','Strength, mobility, flexibility, tendon, bone and movement progression.',52,'hmo52') returning id into v_id;
  end if;
  return v_id;
end; $$;
grant execute on function public.ensure_default_hmo_template() to authenticated;

-- Least-privilege grants. RLS still decides WHICH rows; grants decide WHICH operations are possible at all.
revoke all on public.profiles, public.trainer_clients, public.program_templates, public.client_programs, public.trainer_notes, public.workout_summaries, public.client_invites from anon;
revoke all on public.profiles, public.trainer_clients, public.program_templates, public.client_programs, public.trainer_notes, public.workout_summaries, public.client_invites from authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select, update on public.trainer_clients to authenticated;
grant select, insert, update, delete on public.program_templates to authenticated;
grant select, insert, update, delete on public.client_programs to authenticated;
grant select, insert, update, delete on public.trainer_notes to authenticated;
grant select, insert on public.workout_summaries to authenticated;
grant select on public.client_invites to authenticated;

-- Administrator-only role control. Browser users can never update role directly.
create or replace function public.administrator_set_role(p_profile_id uuid, p_role public.app_role)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare v_row public.profiles%rowtype;
begin
  if auth.uid() is null or public.current_role() <> 'administrator' then raise exception 'administrator_required'; end if;
  if p_profile_id = auth.uid() and p_role <> 'administrator' then raise exception 'cannot_demote_current_administrator'; end if;
  update public.profiles set role=p_role, updated_at=now() where id=p_profile_id returning * into v_row;
  if not found then raise exception 'profile_not_found'; end if;
  return v_row;
end; $$;
grant execute on function public.administrator_set_role(uuid,public.app_role) to authenticated;

-- Administrator can transfer an existing client relationship to another trainer.
create or replace function public.administrator_transfer_client(p_trainer_client_id uuid, p_new_trainer_id uuid)
returns public.trainer_clients language plpgsql security definer set search_path=public as $$
declare v_row public.trainer_clients%rowtype;
begin
  if auth.uid() is null or public.current_role() <> 'administrator' then raise exception 'administrator_required'; end if;
  if not exists(select 1 from public.profiles where id=p_new_trainer_id and role='trainer') then raise exception 'target_not_trainer'; end if;
  update public.trainer_clients set trainer_id=p_new_trainer_id where id=p_trainer_client_id returning * into v_row;
  if not found then raise exception 'relationship_not_found'; end if;
  return v_row;
end; $$;
grant execute on function public.administrator_transfer_client(uuid,uuid) to authenticated;
-- Human Movement OS v0.7 · Client onboarding and coaching operations
-- Apply after v0.6 schema.

do $$ begin create type public.onboarding_status as enum ('draft','submitted','review_needed','approved'); exception when duplicate_object then null; end $$;

create table if not exists public.client_onboarding (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  trainer_client_id uuid references public.trainer_clients(id) on delete cascade,
  status public.onboarding_status not null default 'draft',
  primary_goal text check (char_length(primary_goal) <= 1000),
  experience_level text check (experience_level in ('new','returning','consistent','advanced')),
  training_days_per_week int check (training_days_per_week between 1 and 7),
  preferred_session_minutes int check (preferred_session_minutes between 20 and 120),
  equipment text[] not null default '{}',
  readiness_response text check (readiness_response in ('ready','needs_review')),
  readiness_notes text check (char_length(readiness_notes) <= 1500),
  consent_data boolean not null default false,
  consent_coaching boolean not null default false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_onboarding enable row level security;

drop policy if exists onboarding_client_read on public.client_onboarding;
drop policy if exists onboarding_client_insert on public.client_onboarding;
drop policy if exists onboarding_client_update on public.client_onboarding;
drop policy if exists onboarding_trainer_read on public.client_onboarding;
drop policy if exists onboarding_admin_read on public.client_onboarding;

create policy onboarding_client_read on public.client_onboarding for select using (client_id=auth.uid());
create policy onboarding_client_insert on public.client_onboarding for insert with check (client_id=auth.uid());
create policy onboarding_client_update on public.client_onboarding for update using (client_id=auth.uid()) with check (client_id=auth.uid());
create policy onboarding_trainer_read on public.client_onboarding for select using (
  exists(select 1 from public.trainer_clients tc where tc.client_id=client_onboarding.client_id and tc.trainer_id=auth.uid())
);
create policy onboarding_admin_read on public.client_onboarding for select using (public.current_role()='administrator');

revoke all on public.client_onboarding from anon;
revoke all on public.client_onboarding from authenticated;
grant select, insert, update on public.client_onboarding to authenticated;

-- Client submits onboarding. Status becomes review_needed when the client flags a readiness concern.
create or replace function public.submit_client_onboarding(
  p_primary_goal text,
  p_experience_level text,
  p_training_days_per_week int,
  p_preferred_session_minutes int,
  p_equipment text[],
  p_readiness_response text,
  p_readiness_notes text,
  p_consent_data boolean,
  p_consent_coaching boolean
) returns public.client_onboarding language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_tc uuid; v_row public.client_onboarding%rowtype; v_status public.onboarding_status;
begin
  if v_uid is null or public.current_role()<>'client' then raise exception 'client_required'; end if;
  if coalesce(trim(p_primary_goal),'')='' then raise exception 'goal_required'; end if;
  if p_experience_level not in ('new','returning','consistent','advanced') then raise exception 'invalid_experience'; end if;
  if p_training_days_per_week not between 1 and 7 then raise exception 'invalid_training_days'; end if;
  if p_preferred_session_minutes not between 20 and 120 then raise exception 'invalid_session_minutes'; end if;
  if p_readiness_response not in ('ready','needs_review') then raise exception 'invalid_readiness'; end if;
  if not p_consent_data or not p_consent_coaching then raise exception 'consent_required'; end if;
  select id into v_tc from public.trainer_clients where client_id=v_uid order by created_at desc limit 1;
  if v_tc is null then raise exception 'trainer_relationship_required'; end if;
  v_status:=case when p_readiness_response='needs_review' then 'review_needed' else 'submitted' end;
  insert into public.client_onboarding(client_id,trainer_client_id,status,primary_goal,experience_level,training_days_per_week,preferred_session_minutes,equipment,readiness_response,readiness_notes,consent_data,consent_coaching,submitted_at,updated_at)
  values(v_uid,v_tc,v_status,left(trim(p_primary_goal),1000),p_experience_level,p_training_days_per_week,p_preferred_session_minutes,coalesce(p_equipment,'{}'),p_readiness_response,nullif(left(trim(coalesce(p_readiness_notes,'')),1500),''),p_consent_data,p_consent_coaching,now(),now())
  on conflict(client_id) do update set trainer_client_id=excluded.trainer_client_id,status=excluded.status,primary_goal=excluded.primary_goal,experience_level=excluded.experience_level,training_days_per_week=excluded.training_days_per_week,preferred_session_minutes=excluded.preferred_session_minutes,equipment=excluded.equipment,readiness_response=excluded.readiness_response,readiness_notes=excluded.readiness_notes,consent_data=excluded.consent_data,consent_coaching=excluded.consent_coaching,submitted_at=now(),reviewed_at=null,reviewed_by=null,updated_at=now()
  returning * into v_row;
  return v_row;
end; $$;

grant execute on function public.submit_client_onboarding(text,text,int,int,text[],text,text,boolean,boolean) to authenticated;

-- Trainer reviews onboarding and explicitly activates training. This is coaching approval, not medical clearance.
create or replace function public.trainer_review_onboarding(p_client_id uuid, p_decision text)
returns public.client_onboarding language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_row public.client_onboarding%rowtype; v_tc uuid; v_program uuid;
begin
  if v_uid is null or public.current_role() not in ('trainer','administrator') then raise exception 'trainer_required'; end if;
  select id into v_tc from public.trainer_clients where client_id=p_client_id and (trainer_id=v_uid or public.current_role()='administrator') order by created_at desc limit 1;
  if v_tc is null then raise exception 'client_not_assigned'; end if;
  if p_decision not in ('approved','review_needed') then raise exception 'invalid_decision'; end if;
  update public.client_onboarding set status=p_decision::public.onboarding_status,reviewed_at=now(),reviewed_by=v_uid,updated_at=now() where client_id=p_client_id returning * into v_row;
  if not found then raise exception 'onboarding_not_found'; end if;
  if p_decision='approved' then
    update public.trainer_clients set status='active',goal=coalesce(nullif(v_row.primary_goal,''),goal) where id=v_tc;
    select id into v_program from public.client_programs where trainer_client_id=v_tc order by created_at desc limit 1;
    if v_program is not null then
      update public.client_programs set is_active=false where trainer_client_id=v_tc;
      update public.client_programs set is_active=true where id=v_program;
    end if;
  end if;
  return v_row;
end; $$;

grant execute on function public.trainer_review_onboarding(uuid,text) to authenticated;

-- For NEW invite claims, programme is assigned but kept inactive until onboarding is approved.
create or replace function public.claim_client_invite(p_token text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_inv public.client_invites%rowtype; v_uid uuid:=auth.uid(); v_email text; v_tc uuid;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  select lower(email) into v_email from auth.users where id=v_uid;
  select * into v_inv from public.client_invites where token_hash=digest(p_token,'sha256') for update;
  if not found then raise exception 'invalid_invite'; end if;
  if v_inv.claimed_at is not null and v_inv.client_id<>v_uid then raise exception 'invite_already_claimed'; end if;
  if v_inv.expires_at < now() then raise exception 'invite_expired'; end if;
  if lower(v_inv.email)<>v_email then raise exception 'email_mismatch'; end if;
  update public.profiles set display_name=coalesce(nullif(v_inv.display_name,''),display_name),updated_at=now() where id=v_uid;
  insert into public.trainer_clients(trainer_id,client_id,status,goal,start_date)
  values(v_inv.trainer_id,v_uid,'trial',v_inv.goal,v_inv.start_date)
  on conflict(trainer_id,client_id) do update set goal=excluded.goal,start_date=excluded.start_date
  returning id into v_tc;
  if v_inv.template_id is not null and not exists(select 1 from public.client_programs where trainer_client_id=v_tc) then
    insert into public.client_programs(trainer_client_id,template_id,start_date,current_week,is_active)
    values(v_tc,v_inv.template_id,v_inv.start_date,1,false);
  end if;
  update public.client_invites set claimed_at=now(),client_id=v_uid where id=v_inv.id;
  return v_tc;
end; $$;
