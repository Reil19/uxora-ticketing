drop policy if exists profiles_super_admin_update on public.profiles;
create policy profiles_super_admin_update on public.profiles for update
using (public.is_super_admin()) with check (public.is_super_admin());
