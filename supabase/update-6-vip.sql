-- Fourth & Gold update 6: VIP tables on the leaderboard and in league standings.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- Adds each player's best VIP table (from their saved game) so Diamond players show a 💎.
-- Run updates 4 and 5 first if you haven't.

drop function if exists public.fg_leaderboard();
create function public.fg_leaderboard()
returns table(name text, bank bigint, resets integer, nfl_team text, cfb_team text, updated_at timestamptz, football bigint, casino bigint, debt bigint, xp bigint, vip text)
language sql security definer set search_path = public as $$
  select p.name, p.bank, p.resets, p.nfl_team, p.cfb_team, p.updated_at, f.fb,
         p.bank - 1000000 - f.fb - coalesce((p.state->>'topups')::numeric, 0)::bigint,
         coalesce((p.state->>'debt')::numeric, 0)::bigint,
         coalesce((p.state->'lodge'->>'xp')::numeric, 0)::bigint,
         p.state->>'vipBest'
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
        select f.id, f.name, f.kind, f.game, f.amount, f.n, f.other, f.created_at, f.player_id = me as me,
          (select coalesce(json_object_agg(e.emoji, e.n), '{}'::json) from (select emoji, count(*) n from fg_reacts where feed_id = f.id group by emoji) e) as reacts,
          (select coalesce(json_agg(emoji), '[]'::json) from fg_reacts where feed_id = f.id and player_id = me) as mine
        from fg_feed f where f.league_id = L.id order by f.id desc limit 40) f), '[]'::json));
end $$;
revoke all on function public.fg_league_view(uuid,uuid) from public;
grant execute on function public.fg_league_view(uuid,uuid) to anon, authenticated;
