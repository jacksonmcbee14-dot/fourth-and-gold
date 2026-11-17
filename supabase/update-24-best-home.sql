-- Fourth & Gold · update 24: house scores and the weekly Best Home vote.
--  • Each player's app saves a house score (state.lodge.score).
--  • Visitors can give a home one heart a week. The home with the most hearts (then the higher score) wins the
--    week; the winner is told through the inbox (kind room_winner) when anyone next opens the board.
-- Safe to run more than once.

create or replace function public.fg_hweek(t timestamptz default now()) returns text language sql stable as $$
  select to_char((t at time zone 'America/New_York')::date, 'IYYY-IW');
$$;

create table if not exists public.fg_room_votes (
  voter  uuid not null references public.fg_players(id) on delete cascade,
  owner  uuid not null references public.fg_players(id) on delete cascade,
  week   text not null,
  at     timestamptz not null default now(),
  primary key (voter, owner, week)
);
create index if not exists fg_room_votes_week on public.fg_room_votes(week, owner);
alter table public.fg_room_votes enable row level security;
create table if not exists public.fg_room_awards (
  week   text primary key,
  owner  uuid references public.fg_players(id) on delete set null,
  hearts int not null default 0,
  at     timestamptz not null default now()
);
alter table public.fg_room_awards enable row level security;

create or replace function public.fg_room_vote(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  insert into fg_room_votes(voter, owner, week) values (me.id, them.id, fg_hweek()) on conflict do nothing;
  if not found then return json_build_object('error','already'); end if;
  return json_build_object('ok', true, 'hearts', (select count(*) from fg_room_votes where owner = them.id and week = fg_hweek()));
end $$;

create or replace function public.fg_room_board(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; lw text := fg_hweek(now() - interval '7 days'); win record;
begin
  select * into me from fg_players where token = p_token;
  -- crown last week's winner once
  if not exists (select 1 from fg_room_awards where week = lw) then
    select v.owner, count(*) as n into win from fg_room_votes v join fg_players p on p.id = v.owner
      where v.week = lw group by v.owner, p.state order by count(*) desc, coalesce((p.state->'lodge'->>'score')::numeric,0) desc limit 1;
    insert into fg_room_awards(week, owner, hearts) values (lw, win.owner, coalesce(win.n,0)) on conflict do nothing;
    if found and win.owner is not null then insert into fg_inbox(player_id, kind, amount, label) values (win.owner, 'room_winner', win.n, lw); end if;
  end if;
  return json_build_object('week', fg_hweek(),
    'top', coalesce((select json_agg(x order by x.hearts desc, x.score desc) from (
        select p.name, p.state->'lodge'->'outfit' as outfit, coalesce((p.state->'lodge'->>'score')::numeric,0)::int as score,
               (select count(*) from fg_room_votes v where v.owner = p.id and v.week = fg_hweek()) as hearts
        from fg_players p where coalesce((p.state->'lodge'->>'score')::numeric,0) > 0
        order by 4 desc, 3 desc limit 15) x), '[]'::json),
    'last', (select json_build_object('name', p.name, 'hearts', a.hearts) from fg_room_awards a join fg_players p on p.id = a.owner where a.week = lw));
end $$;

create or replace function public.fg_lodge_view(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; tries int; shield timestamptz; h json;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  select max(at) + interval '1 hour' into shield from fg_heists where victim = them.id and result = 'stole';
  h := fg_home(them.state);
  return json_build_object('name', them.name, 'me', them.id = me.id,
    'outfit', them.state->'lodge'->'outfit', 'pet', them.state->'pet', 'tiers', them.state->'lodge'->'tiers', 'stolen', them.state->'lodge'->'stolen', 'house_score', coalesce((them.state->'lodge'->>'score')::numeric,0)::int,
    'hearts', (select count(*) from fg_room_votes v where v.owner = them.id and v.week = fg_hweek()),
    'hearted', exists (select 1 from fg_room_votes v where v.owner = them.id and v.voter = me.id and v.week = fg_hweek()), 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'),
    'rooms', case when jsonb_typeof(them.state->'lodge'->'rooms')='object' then (them.state->'lodge'->'rooms') - 'vault' else '{}'::jsonb end, 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'home', (h->>'home')::int, 'windows', (h->>'windows')::int, 'cams', (h->>'cams')::int, 'has_safe', (h->>'safe')::bigint > 0,
    'guard', coalesce(fg_num(them.state->'lodge','guardUntil'),0) > (extract(epoch from now())*1000)::bigint,
    'has_tub', coalesce(them.state->'lodge'->'owned','[]'::jsonb) ? 'decor_hottub',
    'tub_now', coalesce((select json_agg(g.name order by s.at) from fg_soaks s join fg_players g on g.id = s.guest where s.host = them.id and s.at > now() - interval '1 hour'), '[]'::json),
    'soaked_today', exists (select 1 from fg_soaks where guest = me.id and host = them.id and at > now() - interval '20 hours'),
    'tries_left', greatest(0, (10 + (select count(*) from fg_try_buys b where b.player = me.id and b.at > now() - interval '24 hours')) - tries), 'tries_bought', (select count(*) from fg_try_buys b where b.player = me.id and b.at > now() - interval '24 hours'), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h2 order by h2.at desc) from (select t.name as thief, x.result, x.amount, x.at from fg_heists x join fg_players t on t.id=x.thief where x.victim = them.id order by x.at desc limit 5) h2), '[]'::json));
end $$;

revoke all on function public.fg_room_vote(uuid,text) from public;
grant execute on function public.fg_room_vote(uuid,text) to anon, authenticated;
revoke all on function public.fg_room_board(uuid) from public;
grant execute on function public.fg_room_board(uuid) to anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
