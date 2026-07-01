create table players (
  id text primary key,
  user_id uuid not null references auth.users(id),
  name text not null,
  avatar text,
  created_at bigint not null
);

create table games (
  id text primary key,
  user_id uuid not null references auth.users(id),
  status text not null,
  variant text not null,
  score_threshold integer not null,
  is_team_mode boolean not null,
  custom_rules text,
  created_at bigint not null,
  completed_at bigint,
  winner_id text
);

create table game_players (
  game_id text not null,
  player_id text not null,
  user_id uuid not null references auth.users(id),
  seat_order integer not null,
  team integer,
  is_eliminated boolean not null,
  primary key (game_id, player_id)
);

create table rounds (
  id text primary key,
  user_id uuid not null references auth.users(id),
  game_id text not null,
  round_number integer not null,
  winner_id text,
  joker_color text,
  created_at bigint not null
);

create table round_scores (
  round_id text not null,
  player_id text not null,
  user_id uuid not null references auth.users(id),
  score integer not null,
  has_posed boolean not null,
  primary key (round_id, player_id)
);

alter table players enable row level security;
alter table games enable row level security;
alter table game_players enable row level security;
alter table rounds enable row level security;
alter table round_scores enable row level security;

create policy "owner full access" on players for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on games for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on game_players for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on rounds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on round_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
