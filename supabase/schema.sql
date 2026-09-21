-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  general_rating integer not null default 1200,
  blackout_rating integer not null default 1200,
  missing_piece_rating integer not null default 1200,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up, so the app
-- never has to worry about a logged-in user without a matching profile.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
