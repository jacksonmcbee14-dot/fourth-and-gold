-- Fourth & Gold update 4: leagues, invites, friend challenges, the league feed and the rewards inbox.
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
--
-- How it fits together
--  • Every player gets a 6-letter invite code. A new player who signs up with it gives the inviter
--    a reward (debt cleared + $1,000,000), delivered through the inbox below.
--  • Leagues: a name, an icon and a weekly prize. Members race on "weekly winnings": the change in
--    their league score since Monday (Eastern time). The first time anyone looks at a league in a new
--    week, last week's leader is crowned and sent the prize.
--  • League score = net worth − daily top-ups − free gifts + money spent at the shop + reset adjustments,
--    all read from the player's saved game, so buying clothes, free money and resets don't move the race.
--  • Challenges: golf or roulette (each plays the same seeded round; best score wins) or a pick'em on
--    a real game. Both sides put up the same stake; the winner is paid through the inbox.
--  • The feed only stores what happened (kind, game, amount) — never free text — and the app writes the words.
--  • Inbox: money and prizes waiting for a player. The app applies them, then acknowledges them.

create table if not exists public.fg_leagues (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null check (char_length(name) between 2 and 24),
  icon       text not null default '🏈',
  prize      text not null,
  owner      uuid not null references public.fg_players(id) on delete cascade,
  week       text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.fg_league_members (
  league_id uuid not null references public.fg_leagues(id) on delete cascade,
  player_id uuid not null references public.fg_players(id) on delete cascade,
  base      bigint not null default 0,
  joined_at timestamptz not null default now(),
  primary key (league_id, player_id)
);
create table if not exists public.fg_league_results (
  league_id   uuid not null references public.fg_leagues(id) on delete cascade,
  week        text not null,
  winner      uuid references public.fg_players(id) on delete set null,
  winner_name text not null,
  profit      bigint not null,
  prize       text not null,
  primary key (league_id, week)
);
create table if not exists public.fg_inbox (
  id         bigserial primary key,
  player_id  uuid not null references public.fg_players(id) on delete cascade,
  kind       text not null,           -- invite | champion | challenge_win | challenge_refund
  amount     bigint not null default 0,
  clear_debt boolean not null default false,
  item       text,
  label      text,
  created_at timestamptz not null default now(),
  acked_at   timestamptz
);
create index if not exists fg_inbox_open on public.fg_inbox(player_id) where acked_at is null;
create table if not exists public.fg_feed (
  id         bigserial primary key,
  league_id  uuid not null references public.fg_leagues(id) on delete cascade,
  player_id  uuid references public.fg_players(id) on delete cascade,
  name       text not null,
  kind       text not null,           -- win | golf | taunt | level | join | champion | challenge
  game       text,
  amount     bigint,
  n          integer,
  other      text,
  created_at timestamptz not null default now()
);
create index if not exists fg_feed_league on public.fg_feed(league_id, id desc);
create table if not exists public.fg_reacts (
  feed_id   bigint not null references public.fg_feed(id) on delete cascade,
  player_id uuid not null references public.fg_players(id) on delete cascade,
  emoji     text not null,
  primary key (feed_id, player_id, emoji)
);
create table if not exists public.fg_challenges (
  id         bigserial primary key,
  from_id    uuid not null references public.fg_players(id) on delete cascade,
  to_id      uuid not null references public.fg_players(id) on delete cascade,
  game       text not null check (game in ('golf','roulette','pick')),
  seed       integer not null default 0,
  stake      bigint not null default 0 check (stake between 0 and 5000000),
  data       jsonb not null default '{}'::jsonb,
  from_score integer,
  to_score   integer,
  status     text not null default 'open',   -- open | accepted | done | declined | cancelled | expired
  winner     uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fg_ch_from on public.fg_challenges(from_id, id desc);
create index if not exists fg_ch_to on public.fg_challenges(to_id, id desc);

alter table public.fg_players add column if not exists ref_code text;
alter table public.fg_players add column if not exists referred_by uuid;
create unique index if not exists fg_players_ref on public.fg_players(ref_code);

do $$ declare t text; begin
  foreach t in array array['fg_leagues','fg_league_members','fg_league_results','fg_inbox','fg_feed','fg_reacts','fg_challenges'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

/* ---------- Helpers ---------- */
create or replace function public.fg_code(n integer) returns text language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random()*32)::int, 1), '') from generate_series(1, n);
$$;
create or replace function public.fg_week() returns text language sql stable as $$
  select to_char(now() at time zone 'America/New_York', 'IYYY-"W"IW');
$$;
-- A number from the saved game, or 0 if it's missing or not a number.
create or replace function public.fg_num(st jsonb, k text) returns bigint language sql immutable as $$
  select case when st ? k and (st->>k) ~ '^-?[0-9]+(\.[0-9]+)?$' then round((st->>k)::numeric)::bigint else 0 end;
$$;
create or replace function public.fg_lscore(b bigint, st jsonb) returns bigint language sql immutable as $$
  select b - fg_num(st,'topups') - fg_num(st,'gifts') + fg_num(st,'spent') + fg_num(st,'ladj');
$$;

-- Every player gets an invite code (new players automatically).
create or replace function public.fg_set_ref() returns trigger language plpgsql as $$
begin
  if new.ref_code is null then
    loop new.ref_code := fg_code(6); exit when not exists (select 1 from fg_players where ref_code = new.ref_code); end loop;
  end if;
  return new;
end $$;
drop trigger if exists fg_players_ref_trg on public.fg_players;
create trigger fg_players_ref_trg before insert on public.fg_players for each row execute function public.fg_set_ref();
do $$ declare r record; c text; begin
  for r in select id from fg_players where ref_code is null loop
    loop c := fg_code(6); exit when not exists (select 1 from fg_players where ref_code = c); end loop;
    update fg_players set ref_code = c where id = r.id;
  end loop;
end $$;

-- Crown last week's leader (once), then start everyone's new week from their current score.
create or replace function public.fg_league_roll(p_league uuid) returns void
language plpgsql security definer set search_path = public as $$
declare L fg_leagues; cw text := fg_week(); w record;
begin
  select * into L from fg_leagues where id = p_league for update;
  if not found or L.week = cw then return; end if;
  select m.player_id, p.name, fg_lscore(p.bank, p.state) - m.base as profit into w
    from fg_league_members m join fg_players p on p.id = m.player_id
    where m.league_id = p_league order by profit desc, m.joined_at asc limit 1;
  if found and w.profit > 0 then
    insert into fg_league_results(league_id, week, winner, winner_name, profit, prize)
      values (p_league, L.week, w.player_id, w.name, w.profit, L.prize) on conflict do nothing;
    insert into fg_inbox(player_id, kind, item, label) values (w.player_id, 'champion', L.prize, L.name);
    insert into fg_feed(league_id, player_id, name, kind, amount, other) values (p_league, w.player_id, w.name, 'champion', w.profit, L.week);
  end if;
  update fg_league_members m set base = fg_lscore(p.bank, p.state) from fg_players p where p.id = m.player_id and m.league_id = p_league;
  update fg_leagues set week = cw where id = p_league;
end $$;

-- Old challenges: unanswered ones expire after 3 days (stake back to the challenger); a golf or roulette
-- challenge that was accepted but never played after 3 days goes to the challenger; a pick'em nobody
-- settled after 14 days is refunded to both.
create or replace function public.fg_ch_expire(p_player uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c fg_challenges;
begin
  for c in select * from fg_challenges where (from_id = p_player or to_id = p_player) and status in ('open','accepted')
             and ((status = 'open' and created_at < now() - interval '3 days')
               or (status = 'accepted' and game <> 'pick' and updated_at < now() - interval '3 days')
               or (status = 'accepted' and game = 'pick' and updated_at < now() - interval '14 days')) for update loop
    if c.status = 'open' then
      update fg_challenges set status = 'expired', updated_at = now() where id = c.id;
      if c.stake > 0 then insert into fg_inbox(player_id, kind, amount, label) values (c.from_id, 'challenge_refund', c.stake, c.game); end if;
    elsif c.game = 'pick' then
      update fg_challenges set status = 'expired', updated_at = now() where id = c.id;
      if c.stake > 0 then insert into fg_inbox(player_id, kind, amount, label) values (c.from_id, 'challenge_refund', c.stake, c.game), (c.to_id, 'challenge_refund', c.stake, c.game); end if;
    else
      perform fg_ch_finish(c.id, c.from_id);
    end if;
  end loop;
end $$;

-- Pay out a finished challenge (winner null = a tie: both stakes back) and tell the leagues they share.
create or replace function public.fg_ch_finish(p_id bigint, p_winner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c fg_challenges; wn text; ln text; lg uuid;
begin
  select * into c from fg_challenges where id = p_id;
  update fg_challenges set status = 'done', winner = p_winner, updated_at = now() where id = p_id;
  if p_winner is null then
    if c.stake > 0 then insert into fg_inbox(player_id, kind, amount, label) values (c.from_id, 'challenge_refund', c.stake, c.game), (c.to_id, 'challenge_refund', c.stake, c.game); end if;
    return;
  end if;
  insert into fg_inbox(player_id, kind, amount, label) values (p_winner, 'challenge_win', c.stake * 2, c.game);
  select name into wn from fg_players where id = p_winner;
  select name into ln from fg_players where id = case when p_winner = c.from_id then c.to_id else c.from_id end;
  for lg in select a.league_id from fg_league_members a join fg_league_members b on a.league_id = b.league_id
             where a.player_id = c.from_id and b.player_id = c.to_id loop
    insert into fg_feed(league_id, player_id, name, kind, game, amount, other) values (lg, p_winner, wn, 'challenge', c.game, c.stake * 2, ln);
  end loop;
end $$;

/* ---------- What the app calls ---------- */

-- Everything the app needs at a glance: your invite code, leagues, inbox and challenges.
create or replace function public.fg_me(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; lg uuid;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  for lg in select league_id from fg_league_members where player_id = me.id loop perform fg_league_roll(lg); end loop;
  perform fg_ch_expire(me.id);
  return json_build_object(
    'name', me.name, 'ref', me.ref_code, 'week', fg_week(),
    'invited', (select count(*) from fg_players where referred_by = me.id),
    'leagues', coalesce((select json_agg(x order by x.joined) from (
        select l.id, l.code, l.name, l.icon, l.prize, l.owner = me.id as mine, m.joined_at as joined,
          (select count(*) from fg_league_members where league_id = l.id) as members,
          fg_lscore(me.bank, me.state) - m.base as profit,
          (select 1 + count(*) from fg_league_members m2 join fg_players p2 on p2.id = m2.player_id
             where m2.league_id = l.id and fg_lscore(p2.bank, p2.state) - m2.base > fg_lscore(me.bank, me.state) - m.base) as rank
        from fg_league_members m join fg_leagues l on l.id = m.league_id where m.player_id = me.id) x), '[]'::json),
    'inbox', coalesce((select json_agg(i order by i.id) from (select id, kind, amount, clear_debt, item, label from fg_inbox where player_id = me.id and acked_at is null) i), '[]'::json),
    'challenges', coalesce((select json_agg(c order by c.id desc) from (
        select c.id, c.game, c.seed, c.stake, c.data, c.status, c.from_score, c.to_score, c.created_at,
          c.from_id = me.id as mine, f.name as from_name, t.name as to_name,
          case when c.winner is null then null when c.winner = me.id then 'me' else 'them' end as result
        from fg_challenges c join fg_players f on f.id = c.from_id join fg_players t on t.id = c.to_id
        where (c.from_id = me.id or c.to_id = me.id) and (c.status in ('open','accepted') or c.updated_at > now() - interval '4 days')
        order by c.id desc limit 40) c), '[]'::json));
end $$;

-- The app has applied these inbox items; don't send them again.
create or replace function public.fg_ack(p_token uuid, p_ids bigint[]) returns json
language sql security definer set search_path = public as $$
  update fg_inbox set acked_at = now() where id = any(p_ids) and acked_at is null
    and player_id = (select id from fg_players where token = p_token);
  select json_build_object('ok', true);
$$;

-- A new player says who invited them. Only within 2 days of signing up, once, and not yourself.
create or replace function public.fg_use_invite(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; inv fg_players;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if me.referred_by is not null then return json_build_object('error','already'); end if;
  if me.created_at < now() - interval '2 days' then return json_build_object('error','too_late'); end if;
  select * into inv from fg_players where ref_code = upper(btrim(p_code));
  if not found or inv.id = me.id then return json_build_object('error','bad_code'); end if;
  update fg_players set referred_by = inv.id where id = me.id;
  if (select count(*) from fg_players where referred_by = inv.id) <= 25 then
    insert into fg_inbox(player_id, kind, amount, clear_debt, label) values (inv.id, 'invite', 1000000, true, me.name);
  end if;
  return json_build_object('ok', true, 'inviter', inv.name);
end $$;

create or replace function public.fg_league_create(p_token uuid, p_name text, p_icon text, p_prize text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; v_name text := btrim(p_name); v_code text; v_id uuid;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 24 then return json_build_object('error','bad_name'); end if;
  if p_prize !~ '^league_[a-z0-9_]{1,40}$' then return json_build_object('error','bad_prize'); end if;
  if char_length(coalesce(p_icon,'')) not between 1 and 8 then return json_build_object('error','bad_icon'); end if;
  if (select count(*) from fg_league_members where player_id = me.id) >= 10 then return json_build_object('error','too_many'); end if;
  loop v_code := fg_code(5); exit when not exists (select 1 from fg_leagues where code = v_code); end loop;
  insert into fg_leagues(code, name, icon, prize, owner, week) values (v_code, v_name, p_icon, p_prize, me.id, fg_week()) returning id into v_id;
  insert into fg_league_members(league_id, player_id, base) values (v_id, me.id, fg_lscore(me.bank, me.state));
  return json_build_object('ok', true, 'id', v_id, 'code', v_code);
end $$;

create or replace function public.fg_league_join(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; L fg_leagues;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into L from fg_leagues where code = upper(btrim(p_code));
  if not found then return json_build_object('error','no_league'); end if;
  if exists (select 1 from fg_league_members where league_id = L.id and player_id = me.id) then return json_build_object('ok', true, 'id', L.id, 'name', L.name, 'already', true); end if;
  if (select count(*) from fg_league_members where league_id = L.id) >= 50 then return json_build_object('error','full'); end if;
  if (select count(*) from fg_league_members where player_id = me.id) >= 10 then return json_build_object('error','too_many'); end if;
  perform fg_league_roll(L.id);
  insert into fg_league_members(league_id, player_id, base) values (L.id, me.id, fg_lscore(me.bank, me.state));
  insert into fg_feed(league_id, player_id, name, kind) values (L.id, me.id, me.name, 'join');
  return json_build_object('ok', true, 'id', L.id, 'name', L.name);
end $$;

create or replace function public.fg_league_leave(p_token uuid, p_league uuid) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; L fg_leagues; nxt uuid;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  delete from fg_league_members where league_id = p_league and player_id = me;
  select * into L from fg_leagues where id = p_league;
  if found and L.owner = me then
    select player_id into nxt from fg_league_members where league_id = p_league order by joined_at limit 1;
    if nxt is null then delete from fg_leagues where id = p_league; else update fg_leagues set owner = nxt where id = p_league; end if;
  end if;
  return json_build_object('ok', true);
end $$;

-- The owner can change the name, icon and weekly prize.
create or replace function public.fg_league_edit(p_token uuid, p_league uuid, p_name text, p_icon text, p_prize text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; v_name text := btrim(p_name);
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if not exists (select 1 from fg_leagues where id = p_league and owner = me) then return json_build_object('error','not_owner'); end if;
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 24 then return json_build_object('error','bad_name'); end if;
  if p_prize !~ '^league_[a-z0-9_]{1,40}$' then return json_build_object('error','bad_prize'); end if;
  if char_length(coalesce(p_icon,'')) not between 1 and 8 then return json_build_object('error','bad_icon'); end if;
  update fg_leagues set name = v_name, icon = p_icon, prize = p_prize where id = p_league;
  return json_build_object('ok', true);
end $$;

-- One league: standings for this week, past champions, the feed and its challenges.
create or replace function public.fg_league_view(p_token uuid, p_league uuid) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; L fg_leagues;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if not exists (select 1 from fg_league_members where league_id = p_league and player_id = me) then return json_build_object('error','not_member'); end if;
  perform fg_league_roll(p_league);
  select * into L from fg_leagues where id = p_league;
  return json_build_object(
    'id', L.id, 'code', L.code, 'name', L.name, 'icon', L.icon, 'prize', L.prize, 'mine', L.owner = me, 'week', L.week,
    'members', coalesce((select json_agg(x order by x.profit desc, x.joined) from (
        select p.name, p.id = me as me, m.joined_at as joined, fg_lscore(p.bank, p.state) - m.base as profit,
          coalesce((p.state->'lodge'->>'xp')::numeric, 0)::bigint as xp, p.state->'lodge'->'outfit' as outfit,
          (select count(*) from fg_league_results r where r.league_id = L.id and r.winner = p.id) as titles
        from fg_league_members m join fg_players p on p.id = m.player_id where m.league_id = L.id) x), '[]'::json),
    'champs', coalesce((select json_agg(r order by r.week desc) from (select week, winner_name as name, profit from fg_league_results where league_id = L.id order by week desc limit 8) r), '[]'::json),
    'feed', coalesce((select json_agg(f order by f.id desc) from (
        select f.id, f.name, f.kind, f.game, f.amount, f.n, f.other, f.created_at, f.player_id = me as me,
          (select coalesce(json_object_agg(e.emoji, e.n), '{}'::json) from (select emoji, count(*) n from fg_reacts where feed_id = f.id group by emoji) e) as reacts,
          (select coalesce(json_agg(emoji), '[]'::json) from fg_reacts where feed_id = f.id and player_id = me) as mine
        from fg_feed f where f.league_id = L.id order by f.id desc limit 40) f), '[]'::json));
end $$;

-- Post to the feed of every league you're in. Only facts are stored; the app writes the words.
create or replace function public.fg_post(p_token uuid, p_kind text, p_game text, p_amount bigint, p_n integer) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; lg uuid; last timestamptz;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if p_kind not in ('win','golf','taunt','level','share') then return json_build_object('error','bad_kind'); end if;
  if p_game is not null and p_game !~ '^[a-z0-9_]{1,20}$' then return json_build_object('error','bad_game'); end if;
  select max(created_at) into last from fg_feed where player_id = me.id;
  if last is not null and last > now() - interval '5 seconds' then return json_build_object('error','slow_down'); end if;
  for lg in select league_id from fg_league_members where player_id = me.id loop
    insert into fg_feed(league_id, player_id, name, kind, game, amount, n) values (lg, me.id, me.name, p_kind, p_game, p_amount, p_n);
  end loop;
  return json_build_object('ok', true);
end $$;

create or replace function public.fg_react(p_token uuid, p_feed bigint, p_emoji text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if p_emoji not in ('🔥','👏','😂','😱','💰') then return json_build_object('error','bad_emoji'); end if;
  if not exists (select 1 from fg_feed f join fg_league_members m on m.league_id = f.league_id and m.player_id = me where f.id = p_feed) then return json_build_object('error','not_member'); end if;
  if exists (select 1 from fg_reacts where feed_id = p_feed and player_id = me and emoji = p_emoji) then
    delete from fg_reacts where feed_id = p_feed and player_id = me and emoji = p_emoji;
  else
    insert into fg_reacts(feed_id, player_id, emoji) values (p_feed, me, p_emoji);
  end if;
  return json_build_object('ok', true);
end $$;

-- Challenge someone by name. Golf and roulette: you play first and send your score.
-- Pick'em: you pick a side of a real game; they get the other side.
create or replace function public.fg_ch_create(p_token uuid, p_to text, p_game text, p_stake bigint, p_seed integer, p_score integer, p_data jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; them uuid; v_id bigint;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  select id into them from fg_players where name_key = lower(btrim(p_to));
  if them is null or them = me then return json_build_object('error','no_player'); end if;
  if p_game not in ('golf','roulette','pick') then return json_build_object('error','bad_game'); end if;
  if p_stake < 0 or p_stake > 5000000 then return json_build_object('error','bad_stake'); end if;
  if p_game <> 'pick' and p_score is null then return json_build_object('error','no_score'); end if;
  if p_game = 'pick' and (p_data->>'gid') is null then return json_build_object('error','no_game'); end if;
  if (select count(*) from fg_challenges where from_id = me and status = 'open') >= 20 then return json_build_object('error','too_many'); end if;
  insert into fg_challenges(from_id, to_id, game, seed, stake, from_score, data)
    values (me, them, p_game, coalesce(p_seed,0), p_stake, p_score, coalesce(p_data,'{}'::jsonb)) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

-- Accept (you've put up the stake), decline (challenger's stake goes back) or cancel your own open challenge.
create or replace function public.fg_ch_answer(p_token uuid, p_id bigint, p_answer text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; c fg_challenges;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  select * into c from fg_challenges where id = p_id for update;
  if not found or c.status <> 'open' then return json_build_object('error','gone'); end if;
  if p_answer = 'accept' and c.to_id = me then
    update fg_challenges set status = 'accepted', updated_at = now() where id = p_id;
  elsif (p_answer = 'decline' and c.to_id = me) or (p_answer = 'cancel' and c.from_id = me) then
    update fg_challenges set status = case when p_answer = 'cancel' then 'cancelled' else 'declined' end, updated_at = now() where id = p_id;
    if c.stake > 0 then insert into fg_inbox(player_id, kind, amount, label) values (c.from_id, 'challenge_refund', c.stake, c.game); end if;
  else
    return json_build_object('error','not_yours');
  end if;
  return json_build_object('ok', true);
end $$;

-- The person challenged sends their golf strokes or roulette chips. Lower strokes / more chips wins.
create or replace function public.fg_ch_score(p_token uuid, p_id bigint, p_score integer) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; c fg_challenges; w uuid;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  select * into c from fg_challenges where id = p_id for update;
  if not found or c.status <> 'accepted' or c.to_id <> me or c.game = 'pick' then return json_build_object('error','gone'); end if;
  update fg_challenges set to_score = p_score where id = p_id;
  if p_score = c.from_score then w := null;
  elsif (c.game = 'golf') = (p_score < c.from_score) then w := c.to_id;
  else w := c.from_id; end if;
  perform fg_ch_finish(p_id, w);
  return json_build_object('ok', true, 'result', case when w is null then 'tie' when w = me then 'me' else 'them' end, 'their_score', c.from_score);
end $$;

-- Settle a pick'em once the real game is final: p_side is the side that won ('a', 'h' or 'push').
create or replace function public.fg_ch_pick(p_token uuid, p_id bigint, p_side text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; c fg_challenges; w uuid;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  select * into c from fg_challenges where id = p_id for update;
  if not found or c.status <> 'accepted' or c.game <> 'pick' or me not in (c.from_id, c.to_id) then return json_build_object('error','gone'); end if;
  if p_side = 'push' then w := null; elsif p_side = c.data->>'side' then w := c.from_id; else w := c.to_id; end if;
  perform fg_ch_finish(p_id, w);
  return json_build_object('ok', true);
end $$;

do $$ declare f text; begin
  foreach f in array array[
    'fg_me(uuid)','fg_ack(uuid,bigint[])','fg_use_invite(uuid,text)','fg_league_create(uuid,text,text,text)',
    'fg_league_join(uuid,text)','fg_league_leave(uuid,uuid)','fg_league_edit(uuid,uuid,text,text,text)','fg_league_view(uuid,uuid)',
    'fg_post(uuid,text,text,bigint,integer)','fg_react(uuid,bigint,text)','fg_ch_create(uuid,text,text,bigint,integer,integer,jsonb)',
    'fg_ch_answer(uuid,bigint,text)','fg_ch_score(uuid,bigint,integer)','fg_ch_pick(uuid,bigint,text)'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
  foreach f in array array['fg_league_roll(uuid)','fg_ch_expire(uuid)','fg_ch_finish(bigint,uuid)','fg_set_ref()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
  end loop;
end $$;
