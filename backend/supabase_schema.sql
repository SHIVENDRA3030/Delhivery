-- Migration: Init User Schema
-- Description: Creates profiles and roles tables, setups up RLS, and auto-profile creation trigger.

-- 1. Create Roles Table (Enum-like lookup)
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique, -- e.g., 'user', 'admin'
  description text,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table public.roles enable row level security;

-- Policy: Everyone can read roles (needed for frontend/backend checks)
create policy "Roles are viewable by everyone" 
  on public.roles for select 
  using ( true );

-- Insert default roles (Safe idempotent insert)
insert into public.roles (name, description)
values 
  ('user', 'Standard authenticated user'),
  ('admin', 'System administrator')
on conflict (name) do nothing;


-- 2. Create User Profiles Table
-- Linked 1:1 with auth.users
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role_id uuid references public.roles(id),
  
  -- Profile Fields
  full_name text,
  avatar_url text,
  website text,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Turn on RLS
alter table public.user_profiles enable row level security;

-- 3. RLS Policies for user_profiles

-- Policy: Users can see their own profile
create policy "Users can view own profile" 
  on public.user_profiles for select 
  using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update own profile" 
  on public.user_profiles for update 
  using ( auth.uid() = id );

-- 4. Auto-create Profile Trigger (Supabase Best Practice)
-- Automatically creates a profile entry when a new user signs up via Auth

create or replace function public.handle_new_user() 
returns trigger as $$
declare
  default_role_id uuid;
begin
  select id 
  into default_role_id 
  from public.roles 
  where name = 'user' 
  limit 1;

  insert into public.user_profiles (id, full_name, role_id)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', -- Grab name from metadata if available
    default_role_id
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to allow idempotent runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Updated_at Trigger
-- Automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.user_profiles;

create trigger on_profiles_updated
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

comment on table public.user_profiles is 'Public user data linked to auth.users';
comment on table public.roles is 'Application roles for RBAC';
