-- CC SYSTEM Mail Center Pro
-- Safe additive migration: creates conversation/thread tables without touching reservation_inquiries.

create extension if not exists pgcrypto;

create table if not exists public.mail_threads (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid null,
  client_email text,
  client_name text,
  client_country text,
  client_language text,
  subject text,
  status text not null default 'new',
  priority text not null default 'normal',
  thread_key text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived boolean not null default false,
  is_test boolean not null default false,
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.mail_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.mail_threads(id) on delete cascade,
  inquiry_id uuid null,
  direction text not null check (direction in ('inbound','outbound','internal')),
  channel text not null default 'manual',
  from_email text,
  to_email text,
  reply_to text,
  subject text,
  body_text text,
  body_html text,
  template_id text,
  language text,
  provider text,
  delivered boolean default false,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.mail_thread_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.mail_threads(id) on delete cascade,
  event_type text not null,
  label text,
  note text,
  created_at timestamptz not null default now(),
  created_by text,
  metadata_json jsonb not null default '{}'::jsonb
);

create index if not exists mail_threads_inquiry_id_idx on public.mail_threads(inquiry_id);
create index if not exists mail_threads_status_idx on public.mail_threads(status);
create index if not exists mail_threads_thread_key_idx on public.mail_threads(thread_key);
create index if not exists mail_threads_last_message_at_idx on public.mail_threads(last_message_at desc nulls last);
create index if not exists mail_messages_thread_id_idx on public.mail_messages(thread_id, created_at);
create index if not exists mail_messages_inquiry_id_idx on public.mail_messages(inquiry_id);
create index if not exists mail_thread_events_thread_id_idx on public.mail_thread_events(thread_id, created_at);
