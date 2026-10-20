-- Editable site settings (single row), Instagram posts and a public "media" bucket for uploads.
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Hura Business',
  tagline text not null default '',
  about text not null default '',
  instagram_handle text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  city text not null default '',
  hero_badge text not null default '',
  hero_title text not null default '',
  hero_prefix text not null default 'ابدأ من',
  hero_words text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "Anyone can read site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update site settings" on public.site_settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  title text not null,
  caption text not null default '',
  url text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.instagram_posts enable row level security;
create policy "Anyone can read instagram posts" on public.instagram_posts for select to anon, authenticated using (true);
create policy "Admins insert instagram posts" on public.instagram_posts for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update instagram posts" on public.instagram_posts for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete instagram posts" on public.instagram_posts for delete to authenticated using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
on conflict (id) do nothing;
create policy "Admins read media" on storage.objects for select to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));

-- TEMPORARY (no-login admin, owner request) — removed by restore_admin_protection.sql
create policy "TEMP open: update site_settings" on public.site_settings for update to anon using (true) with check (true);
create policy "TEMP open: insert instagram_posts" on public.instagram_posts for insert to anon with check (true);
create policy "TEMP open: update instagram_posts" on public.instagram_posts for update to anon using (true) with check (true);
create policy "TEMP open: delete instagram_posts" on public.instagram_posts for delete to anon using (true);
create policy "TEMP open: read media" on storage.objects for select to anon using (bucket_id = 'media');
create policy "TEMP open: upload media" on storage.objects for insert to anon with check (bucket_id = 'media');
create policy "TEMP open: delete media" on storage.objects for delete to anon using (bucket_id = 'media');
