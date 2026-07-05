-- TASK 127: Production CAMP stays and lightweight public analytics foundation.
-- Safe additive migration. Existing data is not touched.

create extension if not exists pgcrypto;

create table if not exists public.camp_stays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'camp',
  status text not null default 'active',
  case_number text unique,
  client_name text not null,
  country text,
  country_code text,
  language text,
  phone text,
  email text,
  document_number text,
  arrival_date date,
  departure_date date,
  nights integer not null default 1,
  arrival_time text,
  stay_type text,
  adults integer not null default 0,
  children_4_14 integer not null default 0,
  children_0_4 integer not null default 0,
  total_guests integer not null default 0,
  vehicle_type text,
  vehicle_plate text,
  trailer_plate text,
  vehicle_notes text,
  services_json jsonb not null default '[]'::jsonb,
  payment_json jsonb not null default '{}'::jsonb,
  total_pln numeric(10,2) not null default 0,
  paid_pln numeric(10,2) not null default 0,
  remaining_pln numeric(10,2) not null default 0,
  is_bajt boolean not null default false,
  gus_excluded boolean not null default false,
  notes text,
  raw_payload_json jsonb not null default '{}'::jsonb
);

alter table if exists public.camp_stays add column if not exists updated_at timestamptz not null default now();
alter table if exists public.camp_stays add column if not exists id uuid default gen_random_uuid();
alter table if exists public.camp_stays add column if not exists created_at timestamptz not null default now();
alter table if exists public.camp_stays add column if not exists source text not null default 'camp';
alter table if exists public.camp_stays add column if not exists status text not null default 'active';
alter table if exists public.camp_stays add column if not exists case_number text;
alter table if exists public.camp_stays add column if not exists client_name text;
alter table if exists public.camp_stays add column if not exists country text;
alter table if exists public.camp_stays add column if not exists country_code text;
alter table if exists public.camp_stays add column if not exists language text;
alter table if exists public.camp_stays add column if not exists phone text;
alter table if exists public.camp_stays add column if not exists email text;
alter table if exists public.camp_stays add column if not exists document_number text;
alter table if exists public.camp_stays add column if not exists arrival_date date;
alter table if exists public.camp_stays add column if not exists departure_date date;
alter table if exists public.camp_stays add column if not exists nights integer not null default 1;
alter table if exists public.camp_stays add column if not exists arrival_time text;
alter table if exists public.camp_stays add column if not exists stay_type text;
alter table if exists public.camp_stays add column if not exists adults integer not null default 0;
alter table if exists public.camp_stays add column if not exists children_4_14 integer not null default 0;
alter table if exists public.camp_stays add column if not exists children_0_4 integer not null default 0;
alter table if exists public.camp_stays add column if not exists total_guests integer not null default 0;
alter table if exists public.camp_stays add column if not exists vehicle_type text;
alter table if exists public.camp_stays add column if not exists vehicle_plate text;
alter table if exists public.camp_stays add column if not exists trailer_plate text;
alter table if exists public.camp_stays add column if not exists vehicle_notes text;
alter table if exists public.camp_stays add column if not exists services_json jsonb not null default '[]'::jsonb;
alter table if exists public.camp_stays add column if not exists payment_json jsonb not null default '{}'::jsonb;
alter table if exists public.camp_stays add column if not exists total_pln numeric(10,2) not null default 0;
alter table if exists public.camp_stays add column if not exists paid_pln numeric(10,2) not null default 0;
alter table if exists public.camp_stays add column if not exists remaining_pln numeric(10,2) not null default 0;
alter table if exists public.camp_stays add column if not exists is_bajt boolean not null default false;
alter table if exists public.camp_stays add column if not exists gus_excluded boolean not null default false;
alter table if exists public.camp_stays add column if not exists notes text;
alter table if exists public.camp_stays add column if not exists raw_payload_json jsonb not null default '{}'::jsonb;

create index if not exists camp_stays_created_at_idx on public.camp_stays (created_at desc);
create index if not exists camp_stays_arrival_date_idx on public.camp_stays (arrival_date);
create index if not exists camp_stays_country_code_idx on public.camp_stays (country_code);
create index if not exists camp_stays_status_idx on public.camp_stays (status);
create index if not exists camp_stays_case_number_idx on public.camp_stays (case_number);

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  page_path text,
  locale text,
  country_guess text,
  referrer text,
  device_type text,
  metadata_json jsonb not null default '{}'::jsonb
);

alter table if exists public.site_events add column if not exists locale text;
alter table if exists public.site_events add column if not exists country_guess text;
alter table if exists public.site_events add column if not exists referrer text;
alter table if exists public.site_events add column if not exists device_type text;
alter table if exists public.site_events add column if not exists metadata_json jsonb not null default '{}'::jsonb;

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_event_type_idx on public.site_events (event_type);
create index if not exists site_events_locale_idx on public.site_events (locale);
create index if not exists site_events_country_guess_idx on public.site_events (country_guess);
