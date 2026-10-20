-- Removes every temporary "TEMP open" policy, so only signed-in admins
-- (emails in public.admins) can manage content, uploads and submissions again.
-- Run this together with re-adding a login screen to /admin.
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname in ('public', 'storage') and policyname like 'TEMP open:%' loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;
