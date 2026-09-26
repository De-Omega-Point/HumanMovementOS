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
