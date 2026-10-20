-- Orders become carts: several ideas per order, with address and a readable code.
alter table public.idea_orders
  alter column idea_title drop not null,
  add column code text,
  add column address text check (char_length(address) <= 500),
  add column items jsonb not null default '[]'::jsonb,
  add column total integer not null default 0 check (total >= 0);
alter table public.idea_orders
  add constraint idea_orders_items_count check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 50);
create unique index idea_orders_code_key on public.idea_orders (code) where code is not null;
-- (existing single-idea orders were converted once; the owner's WhatsApp is set in site_settings)
