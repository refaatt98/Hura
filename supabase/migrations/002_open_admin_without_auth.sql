-- TEMPORARY: the owner asked for an admin page without login.
-- These policies let ANYONE (anon) manage content and read/manage submissions.
-- To restore protection, run supabase/restore_admin_protection.sql
do $$
declare t text;
begin
  foreach t in array array['ideas','workshops'] loop
    execute format('create policy "TEMP open: insert %1$s" on public.%1$I for insert to anon with check (true)', t);
    execute format('create policy "TEMP open: update %1$s" on public.%1$I for update to anon using (true) with check (true)', t);
    execute format('create policy "TEMP open: delete %1$s" on public.%1$I for delete to anon using (true)', t);
  end loop;
  foreach t in array array['idea_orders','custom_requests','workshop_registrations','contact_messages'] loop
    execute format('create policy "TEMP open: read %1$s" on public.%1$I for select to anon using (true)', t);
    execute format('create policy "TEMP open: update %1$s" on public.%1$I for update to anon using (true) with check (true)', t);
    execute format('create policy "TEMP open: delete %1$s" on public.%1$I for delete to anon using (true)', t);
  end loop;
end $$;
