-- Hero prefix text and editable texts/options for the "custom project" form.
alter table public.site_settings add column if not exists hero_prefix text not null default 'ابدأ من';
alter table public.site_settings add column if not exists custom_form jsonb not null default '{}'::jsonb;
-- (initial values were set once; edit them from /admin → إعدادات الموقع)
