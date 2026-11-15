-- Fourth & Gold update 8: the weekly league pick'em and tailing friends' bets.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once. Needs update 4 first.
--
--  • Pick'em: each week every league picks winners of the same slate of games, for free. Picks lock when a game
--    starts. Any member's app reports a final score and everyone's picks on that game are marked right or wrong.
--    When a new week starts, last week's best record is crowned and gets 2,000 XP (through the inbox).
--  • Tailing: placing a bet can post it to your leagues' feed with its picks, so friends can copy it in one tap.

create table if not exists public.fg_picks (
  league_id uuid not null references public.fg_leagues(id) on delete cascade,
  week      text not null,
  player_id uuid not null references public.fg_players(id) on delete cascade,
  gid       text not null,
  side      text not null check (side in ('a','h')),
  label     text,
  starts    timestamptz,
  result    text,                  -- won | lost | push | null (not played yet)
  primary key (league_id, week, player_id, gid)
);
create index if not exists fg_picks_gid on public.fg_picks(gid) where result is null;
create table if not exists public.fg_pickem_results (
  league_id uuid not null references public.fg_leagues(id) on delete cascade,
  week text not null, winner uuid, winner_name text, wins integer,
  primary key (league_id, week)
);
alter table public.fg_picks enable row level security;
alter table public.fg_pickem_results enable row level security;
revoke all on table public.fg_picks from anon, authenticated;
revoke all on table public.fg_pickem_results from anon, authenticated;
alter table public.fg_feed add column if not exists data jsonb;

-- Make a pick (or change it before the game starts).
create or replace function public.fg_pick(p_token uuid, p_league uuid, p_gid text, p_side text, p_label text, p_starts timestamptz) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if not exists (select 1 from fg_league_members where league_id = p_league and player_id = me) then return json_build_object('error','not_member'); end if;
  if p_side not in ('a','h') or char_length(coalesce(p_gid,'')) not between 1 and 40 then return json_build_object('error','bad_pick'); end if;
  if p_starts is not null and p_starts <= now() then return json_build_object('error','locked'); end if;
  if exists (select 1 from fg_picks where league_id = p_league and week = fg_week() and player_id = me and gid = p_gid and (result is not null or starts <= now())) then return json_build_object('error','locked'); end if;
  insert into fg_picks(league_id, week, player_id, gid, side, label, starts) values (p_league, fg_week(), me, p_gid, p_side, left(p_label, 60), p_starts)
    on conflict (league_id, week, player_id, gid) do update set side = excluded.side, label = excluded.label, starts = excluded.starts;
  return json_build_object('ok', true);
end $$;

-- A game is final: mark every open pick on it. p_side is the winning side ('a', 'h' or 'push').
create or replace function public.fg_pick_settle(p_token uuid, p_gid text, p_side text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; n int;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if p_side not in ('a','h','push') then return json_build_object('error','bad_side'); end if;
  update fg_picks set result = case when p_side = 'push' then 'push' when side = p_side then 'won' else 'lost' end
    where gid = p_gid and result is null and (starts is null or starts < now());
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'settled', n);
end $$;

-- This week's pick'em for a league: everyone's record, your picks, everyone's picks on started games, and
-- last week's champion (crowned the first time anyone looks after the week ends).
create or replace function public.fg_pickem(p_token uuid, p_league uuid) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; cw text := fg_week(); lw text; w record;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  if not exists (select 1 from fg_league_members where league_id = p_league and player_id = me) then return json_build_object('error','not_member'); end if;
  for lw in select distinct week from fg_picks where league_id = p_league and week < cw
            and not exists (select 1 from fg_pickem_results r where r.league_id = p_league and r.week = fg_picks.week) loop
    select p.player_id, pl.name, count(*) filter (where p.result = 'won') as wins into w
      from fg_picks p join fg_players pl on pl.id = p.player_id where p.league_id = p_league and p.week = lw
      group by p.player_id, pl.name order by wins desc, count(*) filter (where p.result = 'lost') asc limit 1;
    insert into fg_pickem_results(league_id, week, winner, winner_name, wins) values (p_league, lw, w.player_id, w.name, w.wins) on conflict do nothing;
    if found and w.wins > 0 then
      insert into fg_inbox(player_id, kind, amount, label) values (w.player_id, 'pickem_champ', 2000, (select name from fg_leagues where id = p_league));
      insert into fg_feed(league_id, player_id, name, kind, n, other) values (p_league, w.player_id, w.name, 'pickem', w.wins, lw);
    end if;
  end loop;
  return json_build_object('week', cw,
    'standings', coalesce((select json_agg(x order by x.wins desc, x.losses asc) from (
        select pl.name, pl.id = me as me, count(*) filter (where p.result='won') as wins, count(*) filter (where p.result='lost') as losses, count(*) as picks
        from fg_league_members m join fg_players pl on pl.id = m.player_id left join fg_picks p on p.player_id = m.player_id and p.league_id = m.league_id and p.week = cw
        where m.league_id = p_league group by pl.name, pl.id) x), '[]'::json),
    'mine', coalesce((select json_object_agg(gid, json_build_object('side', side, 'result', result)) from fg_picks where league_id = p_league and week = cw and player_id = me), '{}'::json),
    'others', coalesce((select json_agg(json_build_object('name', pl.name, 'gid', p.gid, 'side', p.side, 'result', p.result)) from fg_picks p join fg_players pl on pl.id = p.player_id
        where p.league_id = p_league and p.week = cw and p.player_id <> me and (p.starts is null or p.starts <= now())), '[]'::json),
    'last', (select json_build_object('week', week, 'name', winner_name, 'wins', wins) from fg_pickem_results where league_id = p_league order by week desc limit 1));
end $$;

-- Post a bet to your leagues so friends can tail it. p_data: the bet's picks (kept small).
create or replace function public.fg_post_bet(p_token uuid, p_amount bigint, p_data jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; lg uuid;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if p_data is null or jsonb_typeof(p_data->'legs') <> 'array' or octet_length(p_data::text) > 4000 then return json_build_object('error','bad_bet'); end if;
  for lg in select league_id from fg_league_members where player_id = me.id loop
    insert into fg_feed(league_id, player_id, name, kind, amount, n, data) values (lg, me.id, me.name, 'bet', p_amount, jsonb_array_length(p_data->'legs'), p_data);
  end loop;
  return json_build_object('ok', true);
end $$;

-- The league view now includes each feed post's data (for the Tail button).
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
          coalesce((p.state->'lodge'->>'xp')::numeric, 0)::bigint as xp, p.state->'lodge'->'outfit' as outfit, p.state->>'vipBest' as vip,
          (select count(*) from fg_league_results r where r.league_id = L.id and r.winner = p.id) as titles
        from fg_league_members m join fg_players p on p.id = m.player_id where m.league_id = L.id) x), '[]'::json),
    'champs', coalesce((select json_agg(r order by r.week desc) from (select week, winner_name as name, profit from fg_league_results where league_id = L.id order by week desc limit 8) r), '[]'::json),
    'feed', coalesce((select json_agg(f order by f.id desc) from (
        select f.id, f.name, f.kind, f.game, f.amount, f.n, f.other, f.data, f.created_at, f.player_id = me as me,
          (select coalesce(json_object_agg(e.emoji, e.n), '{}'::json) from (select emoji, count(*) n from fg_reacts where feed_id = f.id group by emoji) e) as reacts,
          (select coalesce(json_agg(emoji), '[]'::json) from fg_reacts where feed_id = f.id and player_id = me) as mine
        from fg_feed f where f.league_id = L.id order by f.id desc limit 40) f), '[]'::json));
end $$;

revoke all on function public.fg_pick(uuid,uuid,text,text,text,timestamptz) from public;
grant execute on function public.fg_pick(uuid,uuid,text,text,text,timestamptz) to anon, authenticated;
revoke all on function public.fg_pick_settle(uuid,text,text) from public;
grant execute on function public.fg_pick_settle(uuid,text,text) to anon, authenticated;
revoke all on function public.fg_pickem(uuid,uuid) from public;
grant execute on function public.fg_pickem(uuid,uuid) to anon, authenticated;
revoke all on function public.fg_post_bet(uuid,bigint,jsonb) from public;
grant execute on function public.fg_post_bet(uuid,bigint,jsonb) to anon, authenticated;
