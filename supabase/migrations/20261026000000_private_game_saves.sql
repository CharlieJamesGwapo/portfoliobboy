-- Existing gameplay uses local saves. Do not expose a shared, ownerless save
-- table. An authenticated owner_id policy is required before cloud saves return.
alter table public.game_saves enable row level security;
drop policy if exists "game_saves_public_read" on public.game_saves;
drop policy if exists "game_saves_public_insert" on public.game_saves;
drop policy if exists "game_saves_public_update" on public.game_saves;
revoke all on table public.game_saves from anon, authenticated;
