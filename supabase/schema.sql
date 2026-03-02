-- Eid Chanda Ultimate Schema (Paste in Supabase SQL Editor)
-- This version is "idempotent" (you can run it many times without errors)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

------------------------------------------------------------------
-- 1. AUTH & PROFILES
------------------------------------------------------------------

-- Profiles: one per user (synced from auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  email text, 
  avatar_url text,
  phone text,
  show_phone boolean default true,
  card_quote text,
  bkash_number text,
  nagad_number text,
  rocket_number text,
  upay_number text,
  dbbl_number text,
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

-- Drop existing policies to prevent "already exists" errors
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

------------------------------------------------------------------
-- 2. AUTOMATIC TRIGGERS (THE FIXES)
------------------------------------------------------------------

-- Function A: Instant Email Confirmation (Fixes "Invalid login credentials")
create or replace function public.confirm_new_user_instantly()
returns trigger as $$
begin
  new.email_confirmed_at = now(); -- Skip email verification
  return new;
end;
$$ language plpgsql security definer;

-- Trigger A: Before saving user to auth.users
drop trigger if exists confirm_new_user_instantly_trigger on auth.users;
create trigger confirm_new_user_instantly_trigger
  before insert on auth.users
  for each row execute function public.confirm_new_user_instantly();

-- Function B: Sync Auth User to Profiles Table
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || replace(left(new.id::text, 8), '-', '')),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger B: After Auth User is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------------
-- 3. KHĀM (Digital Cards)
------------------------------------------------------------------

create table if not exists public.khams (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete set null,
  receiver_name text not null,
  amount text not null,
  letter_text text,
  anonymous boolean default false,
  voice_url text,
  location text,
  scheduled_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  slug text unique not null,
  reaction text,
  auto_destruct boolean default false,
  is_public_dua boolean default false,
  receiver_id uuid references public.profiles(id) on delete cascade,
  payment_method text,
  payment_number text,
  card_image_url text
);

create index if not exists khams_slug_idx on public.khams(slug);
create index if not exists khams_sender_id_idx on public.khams(sender_id);

alter table public.khams enable row level security;

drop policy if exists "Anyone can view a kham by slug" on public.khams;
create policy "Anyone can view a kham by slug"
  on public.khams for select
  using (true);

drop policy if exists "Authenticated users can insert khams" on public.khams;
create policy "Authenticated users can insert khams"
  on public.khams for insert
  with check (auth.uid() is not null);

drop policy if exists "Anyone with ID can update delivered_at and reaction" on public.khams;
create policy "Anyone with ID can update delivered_at and reaction"
  on public.khams for update
  using (true);

------------------------------------------------------------------
-- 4. SOCIAL & MESSAGES
------------------------------------------------------------------

-- Archive
create table if not exists public.archive (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  kham_id uuid references public.khams(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(user_id, kham_id)
);
alter table public.archive enable row level security;
drop policy if exists "Users can manage own archive" on public.archive;
create policy "Users can manage own archive" on public.archive using (auth.uid() = user_id);

-- Friendships
create table if not exists public.friendships (
  id uuid primary key default uuid_generate_v4(),
  user_id1 uuid references public.profiles(id) on delete cascade not null,
  user_id2 uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('pending', 'accepted', 'declined')),
  action_user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id1, user_id2)
);
alter table public.friendships enable row level security;
drop policy if exists "Users can view/manage own friendships" on public.friendships;
create policy "Users can view/manage own friendships" on public.friendships using (auth.uid() = user_id1 or auth.uid() = user_id2);

-- Messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;
drop policy if exists "Users can view own messages" on public.messages;
create policy "Users can view own messages" on public.messages using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Duas
create table if not exists public.duas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.duas enable row level security;
drop policy if exists "Duas are viewable by everyone" on public.duas;
create policy "Duas are viewable by everyone" on public.duas for select using (true);
drop policy if exists "Users can manage own duas" on public.duas;
create policy "Users can manage own duas" on public.duas using (auth.uid() = user_id);

------------------------------------------------------------------
-- 5. FINAL TASKS
------------------------------------------------------------------

-- Force API reload
NOTIFY pgrst, 'reload schema';

-- Retroactively confirm all old users
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
