-- Overrides for every editable site text (key → text). Defaults live in src/data/texts.ts.
alter table public.site_settings add column if not exists texts jsonb not null default '{}'::jsonb;
