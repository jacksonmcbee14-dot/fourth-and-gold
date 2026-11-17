-- Fourth & Gold · update 26: the weekly slots tournament.
--  • Buy in once a week (the server takes the fee off your saved bankroll and adds it to the pot).
--  • Your score is the sum of your 10 best slot wins measured in multiples of your bet, so any bet size can win.
--  • When the week ends, the top 3 split the pot 50 / 30 / 20 (plus a house bonus); winners are paid through the
--    inbox (kind tourney_win) the next time anyone opens the board.
-- Safe to run more than once.

create table if not exists public.fg_tourney (
  week    text not null,
  player  uuid not null references public.fg_players(id) on delete cascade,
  name    text not null,
  fee     bigint not null,
  score   numeric not null default 0,
  at      timestamptz not null default now(),
  primary key (week, player)
);
alter table public.fg_tourney enable row level security;
create table if not exists public.fg_tourney_paid (week text primary key, at timestamptz not null default now());
alter table public.fg_tourney_paid enable row level security;

create or replace function public.fg_tourney_join(p_token uuid, p_fee bigint) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players;
begin
  select * into me from fg_players where token = p_token for update;
  if not found then return json_build_object('error','signed_out'); end if;
  if p_fee is null or p_fee < 1 then return json_build_object('error','bad_fee'); end if;
  if p_fee > me.bank then return json_build_object('error','too_much'); end if;
  if exists (select 1 from fg_tourney where week = fg_hweek() and player = me.id) then return json_build_object('error','entered'); end if;
  update fg_players set bank = bank - p_fee where id = me.id;
  insert into fg_tourney(week, player, name, fee) values (fg_hweek(), me.id, me.name, p_fee);
  return json_build_object('ok', true);
end $$;

create or replace function public.fg_tourney_score(p_token uuid, p_score numeric) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  update fg_tourney set score = greatest(score, least(p_score, 100000)) where week = fg_hweek() and player = me.id;
  return json_build_object('ok', found);
end $$;

create or replace function public.fg_tourney_board(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare lw text := fg_hweek(now() - interval '7 days'); pot numeric; r record; i int := 0; share numeric[] := array[.5,.3,.2];
begin
  if not exists (select 1 from fg_tourney_paid where week = lw) then
    insert into fg_tourney_paid(week) values (lw) on conflict do nothing;
    if found then
      select coalesce(sum(fee),0) + 1000000 into pot from fg_tourney where week = lw;
      for r in select player, score from fg_tourney where week = lw and score > 0 order by score desc, at limit 3 loop
        i := i + 1;
        insert into fg_inbox(player_id, kind, amount, label) values (r.player, 'tourney_win', floor(pot * share[i])::bigint, '#' || i || ' · ' || lw);
      end loop;
    end if;
  end if;
  return json_build_object('week', fg_hweek(),
    'pot', (select coalesce(sum(fee),0) + 1000000 from fg_tourney where week = fg_hweek()),
    'players', coalesce((select json_agg(json_build_object('name', t.name, 'score', round(t.score,1), 'me', p.token = p_token) order by t.score desc, t.at) from fg_tourney t join fg_players p on p.id = t.player where t.week = fg_hweek()), '[]'::json),
    'last', coalesce((select json_agg(json_build_object('name', t.name, 'score', round(t.score,1)) order by t.score desc, t.at) from (select * from fg_tourney where week = lw and score > 0 order by score desc, at limit 3) t), '[]'::json));
end $$;

revoke all on function public.fg_tourney_join(uuid,bigint) from public;     grant execute on function public.fg_tourney_join(uuid,bigint) to anon, authenticated;
revoke all on function public.fg_tourney_score(uuid,numeric) from public;   grant execute on function public.fg_tourney_score(uuid,numeric) to anon, authenticated;
revoke all on function public.fg_tourney_board(uuid) from public;           grant execute on function public.fg_tourney_board(uuid) to anon, authenticated;
