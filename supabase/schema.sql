-- Eid Chanda MVP schema (run in Supabase SQL Editor)

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- Profiles: one per user (synced from auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
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

-- RLS
alter table public.profiles enable row level security;

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

-- Khām (digital letter + salami)
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
create index if not exists khams_scheduled_at_idx on public.khams(scheduled_at);

alter table public.khams enable row level security;

drop policy if exists "Anyone can view a kham by slug (for open link)" on public.khams;
create policy "Anyone can view a kham by slug (for open link)"
  on public.khams for select
  using (true);

drop policy if exists "Authenticated users can insert khams" on public.khams;
create policy "Authenticated users can insert khams"
  on public.khams for insert
  with check (auth.uid() is not null);

drop policy if exists "Users can update own sent khams (e.g. delivered_at)" on public.khams;
drop policy if exists "Anyone with ID can update delivered_at and reaction" on public.khams;
create policy "Anyone with ID can update delivered_at and reaction"
  on public.khams for update
  using (true)
  with check (true);

-- Archive: links a kham to a user who saved it (receiver or viewer)
create table if not exists public.archive (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  kham_id uuid references public.khams(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(user_id, kham_id)
);

create index if not exists archive_user_id_idx on public.archive(user_id);

alter table public.archive enable row level security;

drop policy if exists "Users can view own archive" on public.archive;
create policy "Users can view own archive"
  on public.archive for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own archive" on public.archive;
create policy "Users can insert own archive"
  on public.archive for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own archive" on public.archive;
create policy "Users can delete own archive"
  on public.archive for delete
  using (auth.uid() = user_id);

-- Trigger: create profile on signup (optional; or create in app on first login)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user_' || replace(new.id::text, '-', '')::text
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Force the API cache to reload so the new columns are recognized
NOTIFY pgrst, 'reload schema';

-- 1. Friendships Table
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

create index if not exists friendships_user_id1_idx on public.friendships(user_id1);
create index if not exists friendships_user_id2_idx on public.friendships(user_id2);

alter table public.friendships enable row level security;

drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view own friendships"
  on public.friendships for select
  using (auth.uid() = user_id1 or auth.uid() = user_id2);

drop policy if exists "Users can insert own friendships" on public.friendships;
create policy "Users can insert own friendships"
  on public.friendships for insert
  with check (auth.uid() = user_id1 or auth.uid() = user_id2);

drop policy if exists "Users can update own friendships" on public.friendships;
create policy "Users can update own friendships"
  on public.friendships for update
  using (auth.uid() = user_id1 or auth.uid() = user_id2);

drop policy if exists "Users can delete own friendships" on public.friendships;
create policy "Users can delete own friendships"
  on public.friendships for delete
  using (auth.uid() = user_id1 or auth.uid() = user_id2);

-- 2. Messages Table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);

alter table public.messages enable row level security;

drop policy if exists "Users can view own messages" on public.messages;
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update own received messages (mark as read)" on public.messages;
create policy "Users can update own received messages (mark as read)"
  on public.messages for update
  using (auth.uid() = receiver_id);

NOTIFY pgrst, 'reload schema';
