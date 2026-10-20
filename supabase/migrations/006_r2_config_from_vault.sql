-- Cloudflare R2 settings live in Supabase Vault (secrets named r2_access_key_id,
-- r2_secret_access_key, r2_endpoint, r2_bucket, r2_public_url — values are NOT in git).
-- Only the server (service_role, used by the r2-upload Edge Function) can read them.
create or replace function public.get_r2_config()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_object_agg(name, decrypted_secret)
  from vault.decrypted_secrets
  where name in ('r2_access_key_id', 'r2_secret_access_key', 'r2_endpoint', 'r2_bucket', 'r2_public_url');
$$;
revoke all on function public.get_r2_config() from public, anon, authenticated;
grant execute on function public.get_r2_config() to service_role;
