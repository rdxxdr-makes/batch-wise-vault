-- Run once in the SQL editor of the Supabase project your Vercel keys point to.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null, year text not null, batch text not null, subject text not null,
  teacher text, type text not null, description text, contributor text, captured_by text,
  file_path text not null, file_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.resources to anon, authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
drop policy if exists "Anyone can view resources" on public.resources;
create policy "Anyone can view resources" on public.resources for select using (true);
insert into storage.buckets (id, name, public) values ('resources', 'resources', false)
  on conflict (id) do nothing;
