-- TASK 148: privacy-friendly analytics intelligence.
-- Safe and additive only: no DROP, DELETE or TRUNCATE.

create extension if not exists pgcrypto;

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

alter table if exists public.site_events add column if not exists country_code text;
alter table if exists public.site_events add column if not exists referrer_domain text;
alter table if exists public.site_events add column if not exists session_id text;
alter table if exists public.site_events add column if not exists element_id text;
alter table if exists public.site_events add column if not exists category text;

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_event_type_idx on public.site_events (event_type);
create index if not exists site_events_page_path_idx on public.site_events (page_path);
create index if not exists site_events_locale_idx on public.site_events (locale);
create index if not exists site_events_country_code_idx on public.site_events (country_code);
create index if not exists site_events_session_id_idx on public.site_events (session_id);

create table if not exists public.analytics_recommendations (
  id uuid primary key default gen_random_uuid(),
  recommendation_key text not null unique,
  status text not null default 'new',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_recommendations_status_check
    check (status in ('new', 'planned', 'done', 'rejected'))
);

alter table if exists public.analytics_recommendations add column if not exists recommendation_key text;
alter table if exists public.analytics_recommendations add column if not exists status text not null default 'new';
alter table if exists public.analytics_recommendations add column if not exists note text;
alter table if exists public.analytics_recommendations add column if not exists created_at timestamptz not null default now();
alter table if exists public.analytics_recommendations add column if not exists updated_at timestamptz not null default now();

create unique index if not exists analytics_recommendations_key_uidx
  on public.analytics_recommendations (recommendation_key);
create index if not exists analytics_recommendations_status_idx
  on public.analytics_recommendations (status);

alter table if exists public.site_events enable row level security;
alter table if exists public.analytics_recommendations enable row level security;
