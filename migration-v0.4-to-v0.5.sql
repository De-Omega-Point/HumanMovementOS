-- Human Movement OS v0.4 -> v0.5 role migration
-- Run only if a v0.4 Supabase schema already exists.

do $$ begin
  alter type public.app_role rename value 'admin' to 'administrator';
exception when invalid_parameter_value then null;
when duplicate_object then null;
end $$;

-- Re-run the v0.5 supabase-schema.sql after this migration so policies and RPCs
-- reference 'administrator' and the Administrator Console functions are installed.
