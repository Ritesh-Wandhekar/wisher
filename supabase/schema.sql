-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (auto-created from Supabase auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Contacts table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  relationship text not null, -- e.g. 'Friend', 'Family', 'Colleague', 'Partner'
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Events table (birthdays, anniversaries, custom)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- 'birthday', 'anniversary', 'custom'
  title text not null, -- e.g. 'Birthday', 'Work Anniversary', 'Graduation'
  date date not null, -- store as date (YYYY-MM-DD), year can be null for recurring
  is_recurring boolean default true, -- true = happens every year
  created_at timestamp with time zone default timezone('utc', now())
);

-- Wish history (so AI never repeats a wish for same person)
create table public.wish_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  contact_id uuid references public.contacts on delete cascade not null,
  event_id uuid references public.events on delete cascade not null,
  wish_text text not null,
  language text not null default 'English',
  tone text not null default 'Warm',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Row Level Security (RLS) — users can only see their own data
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.events enable row level security;
alter table public.wish_history enable row level security;

create policy "Users can manage their own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can manage their own contacts" on public.contacts
  for all using (auth.uid() = user_id);

create policy "Users can manage their own events" on public.events
  for all using (auth.uid() = user_id);

create policy "Users can manage their own wish history" on public.wish_history
  for all using (auth.uid() = user_id);

