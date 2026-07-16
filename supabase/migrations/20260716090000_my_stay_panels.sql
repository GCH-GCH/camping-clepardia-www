-- TASK 140: private My Stay panels linked to reservation inquiries.
-- Safe additive migration. It does not modify or remove existing inquiry data.

create extension if not exists pgcrypto;

create table if not exists public.stay_panels (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  inquiry_id text not null,
  stay_token text not null,
  token_hash text not null,
  locale text not null default 'pl',
  status text not null default 'active',
  last_opened_at timestamptz,
  open_count integer not null default 0,
  feedback_rating smallint,
  feedback_helpful boolean,
  feedback_text text,
  feedback_at timestamptz,
  constraint stay_panels_feedback_rating_check check (feedback_rating is null or feedback_rating between 1 and 5),
  constraint stay_panels_open_count_check check (open_count >= 0)
);

alter table if exists public.stay_panels add column if not exists updated_at timestamptz not null default now();
alter table if exists public.stay_panels add column if not exists inquiry_id text;
alter table if exists public.stay_panels add column if not exists stay_token text;
alter table if exists public.stay_panels add column if not exists token_hash text;
alter table if exists public.stay_panels add column if not exists locale text not null default 'pl';
alter table if exists public.stay_panels add column if not exists status text not null default 'active';
alter table if exists public.stay_panels add column if not exists last_opened_at timestamptz;
alter table if exists public.stay_panels add column if not exists open_count integer not null default 0;
alter table if exists public.stay_panels add column if not exists feedback_rating smallint;
alter table if exists public.stay_panels add column if not exists feedback_helpful boolean;
alter table if exists public.stay_panels add column if not exists feedback_text text;
alter table if exists public.stay_panels add column if not exists feedback_at timestamptz;

create unique index if not exists stay_panels_inquiry_id_uidx on public.stay_panels (inquiry_id);
create unique index if not exists stay_panels_stay_token_uidx on public.stay_panels (stay_token);
create unique index if not exists stay_panels_token_hash_uidx on public.stay_panels (token_hash);
create index if not exists stay_panels_last_opened_at_idx on public.stay_panels (last_opened_at desc);
create index if not exists stay_panels_feedback_at_idx on public.stay_panels (feedback_at desc);

alter table public.stay_panels enable row level security;
alter table if exists public.site_events enable row level security;

comment on table public.stay_panels is 'Private magic-link panels. Access is server-side with the service role only.';
comment on column public.stay_panels.stay_token is 'Opaque 256-bit secret used only to build the customer magic link.';
comment on column public.stay_panels.token_hash is 'SHA-256 token hash used for lookup and privacy-safe event correlation.';
