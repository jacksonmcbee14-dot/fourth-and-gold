-- Fourth & Gold update 9: the $1 quadrillion vault and Prestige stars on the leaderboard.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- Stars rank first on the leaderboard, then money. Bankrolls above the vault are trimmed to it.

update public.fg_players set bank = 1000000000000000,
  state = jsonb_set(jsonb_set(state, '{bank}', '1000000000000000'::jsonb), '{peak}', '1000000000000000'::jsonb)
  where bank > 1000000000000000 and state is not null;

drop function if exists public.fg_leaderboard();
create function public.fg_leaderboard()
returns table(name text, bank bigint, resets integer, nfl_team text, cfb_team text, updated_at timestamptz, football bigint, casino bigint, debt bigint, xp bigint, vip text, outfit jsonb, prestige integer)
language sql security definer set search_path = public as $$
  select p.name, p.bank, p.resets, p.nfl_team, p.cfb_team, p.updated_at, f.fb,
         p.bank - 1000000 - f.fb - coalesce((p.state->>'topups')::numeric, 0)::bigint,
         coalesce((p.state->>'debt')::numeric, 0)::bigint,
         coalesce((p.state->'lodge'->>'xp')::numeric, 0)::bigint,
         p.state->>'vipBest',
         p.state->'lodge'->'outfit',
         case when (p.state->>'prestige') ~ '^[0-9]{1,4}$' then (p.state->>'prestige')::int else 0 end
  from fg_players p
  cross join lateral (
    select coalesce(sum(case b->>'st'
             when 'won'  then (b->>'pay')::numeric - (b->>'stake')::numeric
             when 'lost' then -(b->>'stake')::numeric
             else 0 end), 0)::bigint as fb
    from jsonb_array_elements(case when jsonb_typeof(p.state->'bets') = 'array' then p.state->'bets' else '[]'::jsonb end) b
  ) f
  order by case when (p.state->>'prestige') ~ '^[0-9]{1,4}$' then (p.state->>'prestige')::int else 0 end desc, p.bank desc, p.resets asc, p.created_at asc
  limit 100;
$$;
revoke all on function public.fg_leaderboard() from public;
grant execute on function public.fg_leaderboard() to anon, authenticated;
