alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('customer','admin','super_admin'));
update public.profiles set role='super_admin' where lower(email)='creativovisualchile@gmail.com';

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  permissions text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (user_id,role_id)
);

create table if not exists public.site_settings (
  id text primary key default 'main' check (id='main'),
  hero_event_id uuid references public.events(id) on delete set null,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create or replace function public.is_super_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='super_admin');
$$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','super_admin'));
$$;

alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
drop policy if exists roles_admin_read on public.roles;
create policy roles_admin_read on public.roles for select using (public.is_admin());
drop policy if exists roles_super_admin_write on public.roles;
create policy roles_super_admin_write on public.roles for all using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists user_roles_admin_read on public.user_roles;
create policy user_roles_admin_read on public.user_roles for select using (public.is_admin());
drop policy if exists user_roles_super_admin_write on public.user_roles;
create policy user_roles_super_admin_write on public.user_roles for all using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select using (true);
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('event-images','event-images',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists event_images_public_read on storage.objects;
create policy event_images_public_read on storage.objects for select using (bucket_id='event-images');
drop policy if exists event_images_admin_insert on storage.objects;
create policy event_images_admin_insert on storage.objects for insert with check (bucket_id='event-images' and public.is_admin());
drop policy if exists event_images_admin_update on storage.objects;
create policy event_images_admin_update on storage.objects for update using (bucket_id='event-images' and public.is_admin()) with check (bucket_id='event-images' and public.is_admin());
drop policy if exists event_images_admin_delete on storage.objects;
create policy event_images_admin_delete on storage.objects for delete using (bucket_id='event-images' and public.is_admin());

insert into public.events (slug,name,description,starts_at,venue,address,city,category,image_url,status)
values
('concierto-bajo-las-estrellas','Concierto bajo las estrellas','Música en vivo y una puesta en escena inolvidable.','2026-10-18 20:30:00-03','Movistar Arena','Av. Beauchef 1204','Santiago','Música','https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85','published'),
('festival-primavera','Festival Primavera','Una jornada de música, gastronomía y experiencias.','2026-10-25 12:00:00-03','Parque Bicentenario','','Vitacura','Experiencias','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85','published'),
('experiencia-nocturna','Experiencia Nocturna','Una experiencia inmersiva para descubrir la ciudad de otra forma.','2026-11-07 21:00:00-03','Centro Cultural','','Providencia','Experiencias','https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85','published'),
('final-cup','Final Cup 2026','La final deportiva más esperada del año.','2026-11-16 18:30:00-03','Estadio Nacional','','Ñuñoa','Deportes','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=85','published'),
('summer-sessions','Summer Sessions','Sesiones al aire libre para comenzar el verano.','2026-12-06 17:00:00-03','Club Hípico','','Santiago','Música','https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85','draft'),
('noche-de-jazz','Noche de Jazz','Una noche íntima con grandes exponentes del jazz.','2026-12-11 20:00:00-03','Teatro Municipal','','Santiago','Cultura','https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=85','sold_out')
on conflict (slug) do update set name=excluded.name,description=excluded.description,starts_at=excluded.starts_at,venue=excluded.venue,address=excluded.address,city=excluded.city,category=excluded.category,image_url=excluded.image_url,status=excluded.status;

insert into public.ticket_types(event_id,name,price,stock,status)
select e.id,t.name,t.price,t.stock,t.status from public.events e cross join lateral (values ('General',15000,500,'active'),('VIP',30000,120,'active'),('Premium',50000,50,'active')) as t(name,price,stock,status)
where e.slug='concierto-bajo-las-estrellas' and not exists(select 1 from public.ticket_types where event_id=e.id);

insert into public.site_settings(id,hero_event_id,hero_title,hero_subtitle,hero_image_url)
select 'main',id,'Vive más. Descubre más.','Eventos únicos, entradas simples y momentos inolvidables.',image_url from public.events where slug='concierto-bajo-las-estrellas'
on conflict (id) do nothing;
