-- CC SYSTEM Mail Center Inbox API foundation
-- Safe additive migration: prepares drafts and activity log without changing current reservation flow.

create extension if not exists pgcrypto;

alter table if exists public.mail_threads
  add column if not exists country_code text,
  add column if not exists language text;

create table if not exists public.reply_drafts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid null references public.mail_threads(id) on delete set null,
  inquiry_id text,
  template_type text,
  language text,
  subject text,
  body_text text,
  body_html text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.inbox_activity_log (
  id uuid primary key default gen_random_uuid(),
  inquiry_id text,
  thread_id uuid null references public.mail_threads(id) on delete set null,
  action text not null,
  actor text,
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reply_drafts_thread_id_idx on public.reply_drafts(thread_id, updated_at desc);
create index if not exists reply_drafts_inquiry_id_idx on public.reply_drafts(inquiry_id);
create index if not exists reply_drafts_status_idx on public.reply_drafts(status);
create index if not exists inbox_activity_log_thread_id_idx on public.inbox_activity_log(thread_id, created_at desc);
create index if not exists inbox_activity_log_inquiry_id_idx on public.inbox_activity_log(inquiry_id);
create index if not exists inbox_activity_log_action_idx on public.inbox_activity_log(action);

-- RLS is intentionally not enabled here. CC SYSTEM uses server-side endpoints with the service-role key.
-- Enabling RLS without policies would block the live reception panel.
