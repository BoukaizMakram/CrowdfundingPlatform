-- ═══════════════════════════════════════
-- WaqfFund Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Campaigns table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid,
  creator_name text not null,
  title text not null,
  description text not null,
  goal_amount numeric not null check (goal_amount > 0),
  raised_amount numeric default 0,
  category text not null check (category in ('medical', 'education', 'mosque', 'sadaqa', 'emergency', 'business')),
  cover_image_url text not null,
  media_urls jsonb default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  featured boolean default false,
  created_at timestamptz default now()
);

-- Donations table
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  donor_name text not null,
  amount numeric not null check (amount > 0),
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_category on public.campaigns(category);
create index if not exists idx_campaigns_featured on public.campaigns(featured);
create index if not exists idx_donations_campaign_id on public.donations(campaign_id);

-- Enable RLS
alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.donations enable row level security;

-- ═══════════════════════════════════════
-- RLS Policies (MVP - permissive for now, tighten with auth later)
-- ═══════════════════════════════════════

-- Anyone can read all campaigns (needed for admin page)
create policy "Anyone can view campaigns"
  on public.campaigns for select
  using (true);

-- Anyone can create campaigns (MVP - no auth yet)
create policy "Anyone can create campaigns"
  on public.campaigns for insert
  with check (true);

-- Anyone can update campaigns (MVP - needed for admin approve/reject and raised_amount)
create policy "Anyone can update campaigns"
  on public.campaigns for update
  using (true);

-- Anyone can view donations
create policy "Anyone can view donations"
  on public.donations for select
  using (true);

-- Anyone can create donations
create policy "Anyone can create donations"
  on public.donations for insert
  with check (true);

-- Anyone can view users
create policy "Anyone can view users"
  on public.users for select
  using (true);

-- Anyone can create users (needed for signup profile creation)
create policy "Anyone can create users"
  on public.users for insert
  with check (true);

-- Anyone can update users (MVP)
create policy "Anyone can update users"
  on public.users for update
  using (true);

-- ═══════════════════════════════════════
-- Storage: campaign-images bucket
-- ═══════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('campaign-images', 'campaign-images', true)
on conflict (id) do nothing;

-- Allow anyone to upload images
create policy "Anyone can upload campaign images"
  on storage.objects for insert
  with check (bucket_id = 'campaign-images');

-- Allow anyone to view campaign images
create policy "Anyone can view campaign images"
  on storage.objects for select
  using (bucket_id = 'campaign-images');

-- Allow anyone to delete campaign images (needed for campaign deletion)
create policy "Anyone can delete campaign images"
  on storage.objects for delete
  using (bucket_id = 'campaign-images');

-- ═══════════════════════════════════════
-- Stripe & Payout Migration
-- ═══════════════════════════════════════

-- Add payment tracking to donations
alter table public.donations
  add column if not exists message text,
  add column if not exists payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  add column if not exists stripe_session_id text;

-- Add fee tracking to donations
alter table public.donations
  add column if not exists cover_platform_fee boolean default false,
  add column if not exists platform_fee numeric default 0,
  add column if not exists stripe_fee numeric default 0,
  add column if not exists donor_total_paid numeric default 0,
  add column if not exists net_to_campaign numeric default 0;

-- Add payout method to users
alter table public.users
  add column if not exists payout_method text check (payout_method in ('stripe', 'paypal', 'wise')),
  add column if not exists payout_email text;
