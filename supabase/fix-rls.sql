-- ═══════════════════════════════════════
-- Fix RLS Policies + FK constraints (run this in Supabase SQL Editor)
-- Drops old restrictive policies and creates permissive ones for MVP
-- ═══════════════════════════════════════

-- Drop foreign key constraint on campaigns.creator_id (MVP - no strict user linking)
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_creator_id_fkey;

-- Drop all existing policies on campaigns
drop policy if exists "Anyone can view approved campaigns" on public.campaigns;
drop policy if exists "Anyone can view campaigns" on public.campaigns;
drop policy if exists "Authenticated users can create campaigns" on public.campaigns;
drop policy if exists "Anyone can create campaigns" on public.campaigns;
drop policy if exists "Users can update own campaigns" on public.campaigns;
drop policy if exists "Anyone can update campaigns" on public.campaigns;

-- Drop all existing policies on donations
drop policy if exists "Anyone can view donations" on public.donations;
drop policy if exists "Anyone can create donations" on public.donations;

-- Drop all existing policies on users
drop policy if exists "Anyone can view users" on public.users;
drop policy if exists "Anyone can create users" on public.users;
drop policy if exists "Anyone can update users" on public.users;

-- ═══════════════════════════════════════
-- Recreate permissive policies for MVP
-- ═══════════════════════════════════════

-- Campaigns: full access for MVP
create policy "Anyone can view campaigns"
  on public.campaigns for select using (true);

create policy "Anyone can create campaigns"
  on public.campaigns for insert with check (true);

create policy "Anyone can update campaigns"
  on public.campaigns for update using (true);

drop policy if exists "Anyone can delete campaigns" on public.campaigns;
create policy "Anyone can delete campaigns"
  on public.campaigns for delete using (true);

-- Donations: full access for MVP
create policy "Anyone can view donations"
  on public.donations for select using (true);

create policy "Anyone can create donations"
  on public.donations for insert with check (true);

drop policy if exists "Anyone can delete donations" on public.donations;
create policy "Anyone can delete donations"
  on public.donations for delete using (true);

-- Users: full access for MVP
create policy "Anyone can view users"
  on public.users for select using (true);

create policy "Anyone can create users"
  on public.users for insert with check (true);

create policy "Anyone can update users"
  on public.users for update using (true);

-- ═══════════════════════════════════════
-- Storage: campaign-images bucket
-- ═══════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('campaign-images', 'campaign-images', true)
on conflict (id) do nothing;

-- Drop existing storage policies if any
drop policy if exists "Anyone can upload campaign images" on storage.objects;
drop policy if exists "Anyone can view campaign images" on storage.objects;

-- Allow anyone to upload images
create policy "Anyone can upload campaign images"
  on storage.objects for insert
  with check (bucket_id = 'campaign-images');

-- Allow anyone to view campaign images
create policy "Anyone can view campaign images"
  on storage.objects for select
  using (bucket_id = 'campaign-images');

-- Allow anyone to delete campaign images
drop policy if exists "Anyone can delete campaign images" on storage.objects;
create policy "Anyone can delete campaign images"
  on storage.objects for delete
  using (bucket_id = 'campaign-images');

-- ═══════════════════════════════════════
-- Admin TOTP table for 2FA
-- ═══════════════════════════════════════

create table if not exists public.admin_totp (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  secret text not null,
  verified boolean default false,
  created_at timestamptz default now()
);

alter table public.admin_totp enable row level security;

-- Only service role can access admin_totp (no public access)
drop policy if exists "Service role only" on public.admin_totp;
create policy "Service role only"
  on public.admin_totp for all
  using (false);
