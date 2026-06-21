-- ============================================================================
-- Dungeon Crawler — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- leaderboard
-- ---------------------------------------------------------------------------
create table if not exists public.leaderboard (
  id            uuid primary key default gen_random_uuid(),
  player_name   text not null,
  score         int  not null default 0,
  boss_defeated boolean not null default false,
  time_seconds  int  not null default 0,
  game          text not null default 'dungeon',  -- dungeon | blaster | racer | blockblast
  created_at    timestamptz not null default now()
);

-- If upgrading an existing table, add the column:
alter table public.leaderboard add column if not exists game text not null default 'dungeon';

create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc);

create index if not exists leaderboard_game_score_idx
  on public.leaderboard (game, score desc);

alter table public.leaderboard enable row level security;

-- Public read
drop policy if exists "leaderboard_public_read" on public.leaderboard;
create policy "leaderboard_public_read"
  on public.leaderboard for select
  using (true);

-- Public insert
drop policy if exists "leaderboard_public_insert" on public.leaderboard;
create policy "leaderboard_public_insert"
  on public.leaderboard for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- game_saves
-- ---------------------------------------------------------------------------
create table if not exists public.game_saves (
  id          uuid primary key default gen_random_uuid(),
  player_name text not null,
  save_data   jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create index if not exists game_saves_player_idx
  on public.game_saves (player_name);

alter table public.game_saves enable row level security;

-- Public read
drop policy if exists "game_saves_public_read" on public.game_saves;
create policy "game_saves_public_read"
  on public.game_saves for select
  using (true);

-- Public insert
drop policy if exists "game_saves_public_insert" on public.game_saves;
create policy "game_saves_public_insert"
  on public.game_saves for insert
  with check (true);

-- Public update
drop policy if exists "game_saves_public_update" on public.game_saves;
create policy "game_saves_public_update"
  on public.game_saves for update
  using (true)
  with check (true);
