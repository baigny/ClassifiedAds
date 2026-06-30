-- ============================================================
-- Bazaar — Supabase Schema
-- Run this in the Supabase SQL Editor before seed.sql
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  username    text unique not null,
  email       text unique not null,
  phone       text,
  avatar_url  text,
  role        text not null check (role in ('seller', 'buyer')),
  city        text,
  website     text,
  created_at  timestamptz default now()
);

-- ── Listings ──────────────────────────────────────────────────
create table if not exists listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  title       text not null,
  body        text not null,
  price       integer not null check (price >= 0),
  category    text not null,
  condition   text not null check (condition in ('New', 'Like New', 'Good', 'Fair', 'For Parts')),
  status      text not null default 'active' check (status in ('active', 'sold')),
  images      text[] not null default '{}',
  -- Google Places enrichment (populated automatically after a listing is saved)
  maps_url    text,      -- Google Maps URI for this business/place
  place_id    text,      -- Google Place ID (e.g. ChIJ...)
  created_at  timestamptz default now()
);

-- Allow the enrich-listing edge function (service role) to update maps_url / place_id
-- Service role bypasses RLS, so no extra policy needed.
-- If you ever want the frontend to update listings directly, add:
--   create policy "Owner can update their listing" on listings
--     for update using (auth.uid() = user_id);

-- Index for server-side text search (ilike on title/body)
create index if not exists listings_title_idx on listings using gin (to_tsvector('english', title));
create index if not exists listings_category_idx on listings (category);
create index if not exists listings_status_idx on listings (status);
create index if not exists listings_user_id_idx on listings (user_id);

-- ── Inquiries ─────────────────────────────────────────────────
create table if not exists inquiries (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references listings(id) on delete cascade not null,
  name        text not null,
  email       text not null,
  body        text not null,
  created_at  timestamptz default now()
);

create index if not exists inquiries_listing_id_idx on inquiries (listing_id);

-- ── Row Level Security ────────────────────────────────────────
-- For this demo app, allow anonymous read + insert (no auth required)

alter table profiles  enable row level security;
alter table listings  enable row level security;
alter table inquiries enable row level security;

-- Profiles: public read, no write (seed data only for demo)
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

-- Listings: public read, anyone can insert
create policy "Listings are viewable by everyone"
  on listings for select using (true);
create policy "Anyone can create a listing"
  on listings for insert with check (true);

-- Inquiries: public read, anyone can insert
create policy "Inquiries are viewable by everyone"
  on inquiries for select using (true);
create policy "Anyone can create an inquiry"
  on inquiries for insert with check (true);

-- ── Storage Bucket ────────────────────────────────────────────
-- Run these ONLY if the bucket doesn't already exist
-- (Supabase will error if you re-insert an existing bucket)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public listing images are viewable"
  on storage.objects for select using (bucket_id = 'listing-images');

create policy "Anyone can upload listing images"
  on storage.objects for insert with check (bucket_id = 'listing-images');
