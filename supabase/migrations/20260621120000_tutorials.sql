create table if not exists tutorials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  link text not null,
  platform text not null default 'Dev.to',
  tags text[] default '{}',
  published_at date not null default current_date,
  is_published boolean default true,
  created_at timestamptz default now()
);
alter table tutorials enable row level security;
drop policy if exists "Anyone can read published tutorials" on tutorials;
create policy "Anyone can read published tutorials" on tutorials for select using (is_published = true);
