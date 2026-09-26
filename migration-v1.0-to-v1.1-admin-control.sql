-- Human Movement OS v1.1 · Administrator control + audit
alter table public.profiles add column if not exists account_status text not null default 'active' check (account_status in ('active','suspended'));

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_profile_id uuid references public.profiles(id) on delete set null,
  target_relationship_id uuid references public.trainer_clients(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
drop policy if exists admin_audit_read on public.admin_audit_log;
create policy admin_audit_read on public.admin_audit_log for select using (public.current_role()='administrator');
revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create or replace function public.administrator_set_account_status(p_profile_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_role()<>'administrator' then raise exception 'administrator_required'; end if;
 if p_profile_id=auth.uid() then raise exception 'cannot_suspend_self'; end if;
 if p_status not in ('active','suspended') then raise exception 'invalid_status'; end if;
 update public.profiles set account_status=p_status,updated_at=now() where id=p_profile_id;
 if not found then raise exception 'profile_not_found'; end if;
 insert into public.admin_audit_log(actor_id,action,target_profile_id,metadata) values(auth.uid(),'account_status_changed',p_profile_id,jsonb_build_object('status',p_status));
end $$;
grant execute on function public.administrator_set_account_status(uuid,text) to authenticated;

create or replace function public.administrator_archive_client(p_relationship_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_client uuid;
begin
 if public.current_role()<>'administrator' then raise exception 'administrator_required'; end if;
 select client_id into v_client from public.trainer_clients where id=p_relationship_id;
 if v_client is null then raise exception 'relationship_not_found'; end if;
 update public.trainer_clients set status='archived' where id=p_relationship_id;
 update public.client_programs set is_active=false where trainer_client_id=p_relationship_id;
 insert into public.admin_audit_log(actor_id,action,target_profile_id,target_relationship_id) values(auth.uid(),'client_archived',v_client,p_relationship_id);
end $$;
grant execute on function public.administrator_archive_client(uuid) to authenticated;

create or replace function public.administrator_reset_onboarding(p_client_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_role()<>'administrator' then raise exception 'administrator_required'; end if;
 update public.client_onboarding set status='draft',submitted_at=null,reviewed_at=null,reviewed_by=null,updated_at=now() where client_id=p_client_id;
 update public.trainer_clients set status='trial' where client_id=p_client_id and status<>'archived';
 update public.client_programs set is_active=false where trainer_client_id in (select id from public.trainer_clients where client_id=p_client_id);
 insert into public.admin_audit_log(actor_id,action,target_profile_id) values(auth.uid(),'onboarding_reset',p_client_id);
end $$;
grant execute on function public.administrator_reset_onboarding(uuid) to authenticated;

create or replace function public.administrator_reset_programme(p_relationship_id uuid,p_week int default 1)
returns void language plpgsql security definer set search_path=public as $$
declare v_client uuid;
begin
 if public.current_role()<>'administrator' then raise exception 'administrator_required'; end if;
 if p_week not between 1 and 52 then raise exception 'invalid_week'; end if;
 select client_id into v_client from public.trainer_clients where id=p_relationship_id;
 if v_client is null then raise exception 'relationship_not_found'; end if;
 update public.client_programs set current_week=p_week where trainer_client_id=p_relationship_id and is_active=true;
 insert into public.admin_audit_log(actor_id,action,target_profile_id,target_relationship_id,metadata) values(auth.uid(),'programme_reset',v_client,p_relationship_id,jsonb_build_object('week',p_week));
end $$;
grant execute on function public.administrator_reset_programme(uuid,int) to authenticated;

create or replace function public.administrator_revoke_invite(p_invite_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_role()<>'administrator' then raise exception 'administrator_required'; end if;
 delete from public.client_invites where id=p_invite_id and claimed_at is null;
 insert into public.admin_audit_log(actor_id,action,metadata) values(auth.uid(),'invite_revoked',jsonb_build_object('invite_id',p_invite_id));
end $$;
grant execute on function public.administrator_revoke_invite(uuid) to authenticated;
