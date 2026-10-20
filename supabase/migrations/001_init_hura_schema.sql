-- ───────── Admins ─────────
create table public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- no policies: only reachable through is_admin()

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────── Content: ideas & workshops ─────────
create table public.ideas (
  id text primary key,
  code text not null,
  title text not null,
  category text not null,
  summary text not null,
  description text not null,
  price integer not null check (price >= 0),
  capital_min integer not null check (capital_min >= 0),
  capital_max integer not null check (capital_max >= capital_min),
  payback_months integer not null check (payback_months > 0),
  margin_percent integer not null check (margin_percent between 1 and 100),
  difficulty text not null check (difficulty in ('سهل', 'متوسط', 'متقدم')),
  includes text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workshops (
  id text primary key,
  title text not null,
  summary text not null,
  description text not null,
  date timestamp not null, -- local wall-clock time of the event
  duration_hours integer not null check (duration_hours > 0),
  mode text not null check (mode in ('حضوري', 'أونلاين')),
  location text not null,
  price integer not null check (price >= 0),
  seats integer not null check (seats > 0),
  seats_taken integer not null default 0 check (seats_taken >= 0 and seats_taken <= seats),
  trainer text not null,
  agenda text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;
alter table public.workshops enable row level security;

create policy "Anyone can read ideas" on public.ideas for select to anon, authenticated using (true);
create policy "Admins insert ideas" on public.ideas for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update ideas" on public.ideas for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete ideas" on public.ideas for delete to authenticated using ((select public.is_admin()));

create policy "Anyone can read workshops" on public.workshops for select to anon, authenticated using (true);
create policy "Admins insert workshops" on public.workshops for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update workshops" on public.workshops for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete workshops" on public.workshops for delete to authenticated using ((select public.is_admin()));

-- ───────── Submissions ─────────
create table public.idea_orders (
  id uuid primary key default gen_random_uuid(),
  idea_id text references public.ideas(id) on delete set null,
  idea_title text not null check (char_length(idea_title) <= 200),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (char_length(email) <= 200),
  notes text check (char_length(notes) <= 2000),
  status text not null default 'جديد' check (status in ('جديد', 'قيد المتابعة', 'مكتمل')),
  created_at timestamptz not null default now()
);

create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  field text not null check (char_length(field) <= 100),
  idea text check (char_length(idea) <= 3000),
  budget text not null check (char_length(budget) <= 100),
  city text not null check (char_length(city) between 1 and 100),
  timeline text not null check (char_length(timeline) <= 100),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (char_length(email) <= 200),
  contact_via text not null check (char_length(contact_via) <= 30),
  status text not null default 'جديد' check (status in ('جديد', 'قيد المتابعة', 'مكتمل')),
  created_at timestamptz not null default now()
);

create table public.workshop_registrations (
  id uuid primary key default gen_random_uuid(),
  workshop_id text references public.workshops(id) on delete set null,
  workshop_title text not null,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (char_length(email) <= 200),
  seats integer not null check (seats between 1 and 10),
  notes text check (char_length(notes) <= 2000),
  status text not null default 'جديد' check (status in ('جديد', 'قيد المتابعة', 'مكتمل')),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  contact text not null check (char_length(contact) between 3 and 200),
  subject text not null check (char_length(subject) <= 100),
  message text not null check (char_length(message) between 2 and 5000),
  status text not null default 'جديد' check (status in ('جديد', 'قيد المتابعة', 'مكتمل')),
  created_at timestamptz not null default now()
);

create index on public.idea_orders (created_at desc);
create index on public.idea_orders (idea_id);
create index on public.custom_requests (created_at desc);
create index on public.workshop_registrations (created_at desc);
create index on public.workshop_registrations (workshop_id);
create index on public.contact_messages (created_at desc);

alter table public.idea_orders enable row level security;
alter table public.custom_requests enable row level security;
alter table public.workshop_registrations enable row level security;
alter table public.contact_messages enable row level security;

-- visitors can only create new (status = 'جديد') submissions; admins see & manage everything
create policy "Visitors create orders" on public.idea_orders for insert to anon, authenticated with check (status = 'جديد');
create policy "Admins read orders" on public.idea_orders for select to authenticated using ((select public.is_admin()));
create policy "Admins update orders" on public.idea_orders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete orders" on public.idea_orders for delete to authenticated using ((select public.is_admin()));

create policy "Visitors create custom requests" on public.custom_requests for insert to anon, authenticated with check (status = 'جديد');
create policy "Admins read custom requests" on public.custom_requests for select to authenticated using ((select public.is_admin()));
create policy "Admins update custom requests" on public.custom_requests for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete custom requests" on public.custom_requests for delete to authenticated using ((select public.is_admin()));

-- registrations are created only through register_for_workshop() (keeps seat count correct)
create policy "Admins read registrations" on public.workshop_registrations for select to authenticated using ((select public.is_admin()));
create policy "Admins update registrations" on public.workshop_registrations for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete registrations" on public.workshop_registrations for delete to authenticated using ((select public.is_admin()));

create policy "Visitors create messages" on public.contact_messages for insert to anon, authenticated with check (status = 'جديد');
create policy "Admins read messages" on public.contact_messages for select to authenticated using ((select public.is_admin()));
create policy "Admins update messages" on public.contact_messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using ((select public.is_admin()));

-- ───────── Workshop booking (atomic seat check) ─────────
create or replace function public.register_for_workshop(
  p_workshop_id text,
  p_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null,
  p_seats integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  w public.workshops%rowtype;
  new_id uuid;
begin
  if p_seats is null or p_seats < 1 or p_seats > 5 then
    raise exception 'عدد المقاعد غير صحيح';
  end if;

  select * into w from public.workshops where id = p_workshop_id for update;
  if not found then
    raise exception 'الورشة غير موجودة';
  end if;
  if w.seats - w.seats_taken < p_seats then
    raise exception 'ما في مقاعد كافية';
  end if;

  update public.workshops set seats_taken = seats_taken + p_seats where id = p_workshop_id;

  insert into public.workshop_registrations (workshop_id, workshop_title, name, phone, email, notes, seats)
  values (p_workshop_id, w.title, trim(p_name), trim(p_phone), nullif(trim(p_email), ''), nullif(trim(p_notes), ''), p_seats)
  returning id into new_id;

  return new_id;
end;
$$;
revoke all on function public.register_for_workshop(text, text, text, text, text, integer) from public;
grant execute on function public.register_for_workshop(text, text, text, text, text, integer) to anon, authenticated;
