-- Fourth & Gold update 7: visit and rob friends' lodges, defence items, and characters on the leaderboard.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once. Needs update 4 first.
--
-- How a heist works
--  • You can visit and rob any player (from the leaderboard or your leagues). You get 3 attempts a day.
--  • The app plays the safe-cracking game (harder the higher their VIP table is above yours) and says
--    whether you cracked it. The server decides the rest:
--      cracked → their guard dog, bouncer, cameras and laser grid may still catch you (up to 60%);
--      got away → you take 5% of their net worth, cut by their steel safe (−30%) and vault door (−50%),
--                 and never more than your own net worth (at least $1M). They're then shielded for 12 hours.
--      caught or failed → you pay them a fine of 2% of your net worth (at least $10K).
--  • The victim's app applies the loss (or the fine they collect) from their inbox; the thief's app applies
--    the result straight away. Every heist is posted to both players' leagues.

create table if not exists public.fg_heists (
  id       bigserial primary key,
  thief    uuid not null references public.fg_players(id) on delete cascade,
  victim   uuid not null references public.fg_players(id) on delete cascade,
  result   text not null,          -- stole | caught | failed
  amount   bigint not null default 0,
  at       timestamptz not null default now()
);
create index if not exists fg_heists_thief on public.fg_heists(thief, at desc);
create index if not exists fg_heists_victim on public.fg_heists(victim, at desc);
alter table public.fg_heists enable row level security;
revoke all on table public.fg_heists from anon, authenticated;

-- Which defence items someone owns, and what they add up to.
create or replace function public.fg_defense(st jsonb) returns json language sql immutable as $$
  with own as (select jsonb_array_elements_text(case when jsonb_typeof(st->'lodge'->'owned')='array' then st->'lodge'->'owned' else '[]'::jsonb end) as id)
  select json_build_object(
    'items', coalesce((select json_agg(id) from own where id in ('decor_guard_dog','decor_bouncer','decor_cameras','decor_laser_grid','decor_steel_safe','decor_vault_door')), '[]'::json),
    'catch', least(60, coalesce((select sum(case id when 'decor_guard_dog' then 12 when 'decor_bouncer' then 20 when 'decor_cameras' then 10 when 'decor_laser_grid' then 5 else 0 end) from own), 0)),
    'keep',  (case when exists(select 1 from own where id='decor_steel_safe') then .7 else 1 end) * (case when exists(select 1 from own where id='decor_vault_door') then .5 else 1 end));
$$;
create or replace function public.fg_share_league(a uuid, b uuid) returns boolean language sql stable as $$
  select exists(select 1 from fg_league_members x join fg_league_members y on x.league_id=y.league_id where x.player_id=a and y.player_id=b);
$$;
create or replace function public.fg_vipidx(st jsonb) returns integer language sql immutable as $$
  select case when (st->>'vipIdx') ~ '^[0-9]{1,3}$' then (st->>'vipIdx')::int else 0 end;
$$;

-- Look around a friend's lodge: their character, room, table, defences, and whether you can rob them now.
create or replace function public.fg_lodge_view(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; tries int; shield timestamptz;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  select max(at) + interval '12 hours' into shield from fg_heists where victim = them.id and result = 'stole';
  return json_build_object('name', them.name, 'me', them.id = me.id,
    'outfit', them.state->'lodge'->'outfit', 'room', them.state->'lodge'->'room', 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'tries_left', greatest(0, 3 - tries), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h order by h.at desc) from (select t.name as thief, h.result, h.amount, h.at from fg_heists h join fg_players t on t.id=h.thief where h.victim = them.id order by h.at desc limit 5) h), '[]'::json));
end $$;

-- Try to rob a friend. p_cracked: whether you cracked the safe in the app.
create or replace function public.fg_heist(p_token uuid, p_name text, p_cracked boolean) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; d json; tries int; res text; amt bigint := 0; fine bigint := 0; lg uuid;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name)) for update;
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  if tries >= 3 then return json_build_object('error','no_tries'); end if;
  if exists (select 1 from fg_heists where victim = them.id and result = 'stole' and at > now() - interval '12 hours') then return json_build_object('error','shielded'); end if;
  d := fg_defense(them.state);
  if not p_cracked then res := 'failed';
  elsif random()*100 < (d->>'catch')::numeric then res := 'caught';
  else res := 'stole'; end if;
  if res = 'stole' then
    amt := least(floor(greatest(them.bank,0) * .05 * (d->>'keep')::numeric), greatest(me.bank, 1000000))::bigint;
    if amt <= 0 then res := 'failed'; end if;
  end if;
  if res <> 'stole' then fine := greatest(10000, floor(greatest(me.bank,0) * .02))::bigint; amt := 0; end if;
  insert into fg_heists(thief, victim, result, amount) values (me.id, them.id, res, case when res='stole' then amt else fine end);
  if res = 'stole' then
    insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'robbed', amt, me.name);
  else
    insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'heist_fine', fine, me.name);
  end if;
  for lg in select distinct league_id from fg_league_members where player_id in (me.id, them.id) loop
    insert into fg_feed(league_id, player_id, name, kind, game, amount, n, other)
      values (lg, me.id, me.name, 'heist', res, case when res='stole' then amt else fine end, case res when 'stole' then 1 when 'caught' then 0 else 2 end, them.name);
  end loop;
  return json_build_object('ok', true, 'result', res, 'amount', amt, 'fine', fine, 'tries_left', greatest(0, 2 - tries));
end $$;

-- Leaderboard: add each player's outfit so the app can draw their character.
drop function if exists public.fg_leaderboard();
create function public.fg_leaderboard()
returns table(name text, bank bigint, resets integer, nfl_team text, cfb_team text, updated_at timestamptz, football bigint, casino bigint, debt bigint, xp bigint, vip text, outfit jsonb)
language sql security definer set search_path = public as $$
  select p.name, p.bank, p.resets, p.nfl_team, p.cfb_team, p.updated_at, f.fb,
         p.bank - 1000000 - f.fb - coalesce((p.state->>'topups')::numeric, 0)::bigint,
         coalesce((p.state->>'debt')::numeric, 0)::bigint,
         coalesce((p.state->'lodge'->>'xp')::numeric, 0)::bigint,
         p.state->>'vipBest',
         p.state->'lodge'->'outfit'
  from fg_players p
  cross join lateral (
    select coalesce(sum(case b->>'st'
             when 'won'  then (b->>'pay')::numeric - (b->>'stake')::numeric
             when 'lost' then -(b->>'stake')::numeric
             else 0 end), 0)::bigint as fb
    from jsonb_array_elements(case when jsonb_typeof(p.state->'bets') = 'array' then p.state->'bets' else '[]'::jsonb end) b
  ) f
  order by p.bank desc, p.resets asc, p.created_at asc
  limit 100;
$$;

revoke all on function public.fg_leaderboard() from public;
grant execute on function public.fg_leaderboard() to anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
revoke all on function public.fg_heist(uuid,text,boolean) from public;
grant execute on function public.fg_heist(uuid,text,boolean) to anon, authenticated;
revoke all on function public.fg_defense(jsonb) from public, anon, authenticated;
revoke all on function public.fg_share_league(uuid,uuid) from public, anon, authenticated;
