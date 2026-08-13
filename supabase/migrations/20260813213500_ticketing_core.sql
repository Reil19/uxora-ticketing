create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  starts_at timestamptz not null,
  venue text not null,
  address text not null default '',
  city text not null default '',
  category text not null default 'Experiencias',
  image_url text,
  status text not null default 'draft' check (status in ('draft','published','sold_out','cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  status text not null default 'active' check (status in ('active','hidden','sold_out')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  user_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('TKT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id),
  owner_id uuid not null references public.profiles(id),
  holder_name text not null,
  status text not null default 'valid' check (status in ('valid','used','cancelled')),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id),
  checked_by uuid not null references public.profiles(id),
  result text not null check (result in ('accepted','already_used','invalid')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,full_name,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),case when lower(new.email)='creativovisualchile@gmail.com' then 'admin' else 'customer' end)
  on conflict (id) do update set email=excluded.email, full_name=excluded.full_name, role=excluded.role;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email on auth.users for each row execute procedure public.handle_new_user();

insert into public.profiles (id,email,full_name,role)
select id,email,coalesce(raw_user_meta_data->>'full_name',''),case when lower(email)='creativovisualchile@gmail.com' then 'admin' else 'customer' end
from auth.users on conflict (id) do update set email=excluded.email, full_name=excluded.full_name, role=excluded.role;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;
alter table public.checkins enable row level security;

drop policy if exists profiles_self_or_admin on public.profiles;
create policy profiles_self_or_admin on public.profiles for select using (id=auth.uid() or public.is_admin());
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select using (status in ('published','sold_out') or public.is_admin());
drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists ticket_types_public_read on public.ticket_types;
create policy ticket_types_public_read on public.ticket_types for select using (status in ('active','sold_out') or public.is_admin());
drop policy if exists ticket_types_admin_write on public.ticket_types;
create policy ticket_types_admin_write on public.ticket_types for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select using (user_id=auth.uid() or public.is_admin());
drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_write on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists tickets_owner_read on public.tickets;
create policy tickets_owner_read on public.tickets for select using (owner_id=auth.uid() or public.is_admin());
drop policy if exists tickets_admin_write on public.tickets;
create policy tickets_admin_write on public.tickets for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists checkins_admin_all on public.checkins;
create policy checkins_admin_all on public.checkins for all using (public.is_admin()) with check (public.is_admin());

create index if not exists ticket_types_event_idx on public.ticket_types(event_id);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists tickets_owner_idx on public.tickets(owner_id);
create index if not exists tickets_order_idx on public.tickets(order_id);
