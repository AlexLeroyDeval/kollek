-- =============================================
-- KOLLEK — Schéma MVP
-- =============================================

-- PLATFORM
create table platform (
  id            serial primary key,
  igdb_id       integer unique not null,
  name          text not null,
  manufacturer  text,
  release_year  integer,
  generation    integer,
  abbreviation  text
);

-- GENRE
create table genre (
  id      serial primary key,
  igdb_id integer unique not null,
  name    text not null
);

-- PUBLISHER
create table publisher (
  id      serial primary key,
  igdb_id integer unique not null,
  name    text not null,
  country text
);

-- GAME
create table game (
  id                serial primary key,
  igdb_id           integer not null,
  platform_id       integer not null references platform(id),
  title             text not null,
  release_year      integer,
  region            text,
  cover_front_url   text,
  cover_back_url    text,
  cover_spine_url   text,
  screenscraper_id  integer,
  unique (igdb_id, platform_id)
);

-- GAME_COMPANY (relation game <-> publisher)
create table game_company (
  id           serial primary key,
  game_id      integer not null references game(id) on delete cascade,
  publisher_id integer not null references publisher(id),
  is_developer boolean default false,
  is_publisher boolean default false
);

-- COLLECTION
create table collection (
  id             serial primary key,
  game_id        integer not null references game(id) on delete cascade,
  condition      text not null check (condition in ('Mint','Very Good','Good','Fair','Poor')),
  completion     text not null check (completion in ('loose','cib','box_game','box_notice','game_notice','notice','box','sealed')),
  purchase_price numeric(10,2),
  purchase_date  date,
  is_sold        boolean not null default false,
  sale_price     numeric(10,2),
  sale_date      date,
  notes          text,
  added_at       timestamptz not null default now()
);

-- WISHLIST (créée au MVP, alimentée en v1.2)
create table wishlist (
  id         serial primary key,
  game_id    integer not null references game(id) on delete cascade,
  priority   text check (priority in ('Low','Medium','High')),
  max_budget numeric(10,2),
  added_date date not null default current_date,
  notes      text
);

-- MARKET_PRICE (créée au MVP, alimentée en v1.1)
create table market_price (
  id           serial primary key,
  game_id      integer not null references game(id) on delete cascade,
  loose_price  numeric(10,2),
  cib_price    numeric(10,2),
  graded_price numeric(10,2),
  currency     text not null default 'EUR',
  source       text,
  updated_at   timestamptz not null default now()
);

-- =============================================
-- RLS — Row Level Security
-- Usage perso (MVP) : accès public en lecture/écriture
-- À restreindre en v2 (multi-utilisateur)
-- =============================================

alter table platform     enable row level security;
alter table genre        enable row level security;
alter table publisher    enable row level security;
alter table game         enable row level security;
alter table game_company enable row level security;
alter table collection   enable row level security;
alter table wishlist     enable row level security;
alter table market_price enable row level security;

-- Policies MVP : tout autoriser (usage perso, pas de login)
create policy "allow all" on platform     for all using (true) with check (true);
create policy "allow all" on genre        for all using (true) with check (true);
create policy "allow all" on publisher    for all using (true) with check (true);
create policy "allow all" on game         for all using (true) with check (true);
create policy "allow all" on game_company for all using (true) with check (true);
create policy "allow all" on collection   for all using (true) with check (true);
create policy "allow all" on wishlist     for all using (true) with check (true);
create policy "allow all" on market_price for all using (true) with check (true);

-- =============================================
-- Storage — bucket pour les covers
-- =============================================
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict do nothing;

create policy "covers public read" on storage.objects
  for select using (bucket_id = 'covers');

create policy "covers public insert" on storage.objects
  for insert with check (bucket_id = 'covers');
