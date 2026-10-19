-- Run this in the Supabase SQL editor before exporting the seed data.

do $$
begin
    create type public.stage_status as enum ('not-done', 'pending', 'rejected', 'done');
exception
    when duplicate_object then null;
end
$$;

create table if not exists public.clients (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  priority text null,
  business text null,
  address text null,
  phone text null,
  rating double precision null,
  reviews bigint null,
  reason text null,
  called text null,
  outcome text null,
  paid double precision null,
  notes text null,
  running_comments jsonb not null default '[]'::jsonb,
  research public.stage_status not null default 'not-done'::stage_status,
  cold_call public.stage_status not null default 'not-done'::stage_status,
  meeting_set public.stage_status not null default 'not-done'::stage_status,
  meeting_had public.stage_status not null default 'not-done'::stage_status,
  sale_call public.stage_status not null default 'not-done'::stage_status,
  sold public.stage_status not null default 'not-done'::stage_status,
  constraint calls_pkey primary key (id)
) tablespace pg_default;

create table if not exists public.readme_items (
    id bigint generated always as identity primary key,
    position integer not null,
    title text not null,
    body text not null default ''
);

-- Adds the commentary column to clients that were created before it existed.
alter table public.clients
    add column if not exists running_comments jsonb not null default '[]'::jsonb;

alter table public.clients enable row level security;
alter table public.readme_items enable row level security;

create policy "Signed-in users manage clients"
    on public.clients for all
    to authenticated
    using (true)
    with check (true);

create policy "Signed-in users manage readme items"
    on public.readme_items for all
    to authenticated
    using (true)
    with check (true);
