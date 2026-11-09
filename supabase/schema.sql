-- Gästbok för uzeirovic.se
-- Klistra in allt i Supabase → SQL Editor → New query → Run.

create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  role        text check (char_length(role) <= 40),
  rating      int  not null check (rating between 1 and 5),
  text        text not null check (char_length(text) between 1 and 400),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Namn och profilbild hämtas alltid från Google-kontot, så ingen kan låtsas vara någon annan.
create or replace function public.guestbook_fill_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
begin
  select raw_user_meta_data into meta from auth.users where id = auth.uid();
  new.user_id    := auth.uid();
  new.name       := left(coalesce(meta->>'full_name', meta->>'name', 'En besökare'), 60);
  new.avatar_url := coalesce(meta->>'avatar_url', meta->>'picture');
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists guestbook_fill_profile on public.guestbook;
create trigger guestbook_fill_profile
  before insert or update on public.guestbook
  for each row execute function public.guestbook_fill_profile();

alter table public.guestbook enable row level security;

-- Alla får läsa
drop policy if exists "guestbook read" on public.guestbook;
create policy "guestbook read" on public.guestbook
  for select using (true);

-- Inloggade får skriva ett eget omdöme
drop policy if exists "guestbook insert own" on public.guestbook;
create policy "guestbook insert own" on public.guestbook
  for insert to authenticated with check (auth.uid() = user_id);

-- ...och ändra sitt eget
drop policy if exists "guestbook update own" on public.guestbook;
create policy "guestbook update own" on public.guestbook
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Man får ta bort sitt eget. Ägaren (din mejl) får ta bort alla.
drop policy if exists "guestbook delete" on public.guestbook;
create policy "guestbook delete" on public.guestbook
  for delete to authenticated using (
    auth.uid() = user_id
    or lower(auth.jwt() ->> 'email') = 'uzeirovicemil44@gmail.com'
  );
