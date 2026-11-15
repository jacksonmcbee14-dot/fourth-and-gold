-- Fourth & Gold update 2: debt and daily top-ups on the leaderboard.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- The app now sends each player's score as cash + open bets − debt. This shows what
-- they owe, and leaves daily top-ups (free money, not winnings) out of the casino figure.

drop function if exists public.fg_leaderboard();
create function public.fg_leaderboard()
returns table(name text, bank bigint, resets integer, nfl_team text, cfb_team text, updated_at timestamptz, football bigint, casino bigint, debt bigint)
language sql security definer set search_path = public as $$
  select p.name, p.bank, p.resets, p.nfl_team, p.cfb_team, p.updated_at, f.fb,
         p.bank - 1000000 - f.fb - coalesce((p.state->>'topups')::numeric, 0)::bigint,
         coalesce((p.state->>'debt')::numeric, 0)::bigint
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
