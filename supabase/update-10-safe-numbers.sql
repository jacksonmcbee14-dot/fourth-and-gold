-- Fourth & Gold update 10: league maths can't overflow.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- Numbers read from a saved game are clamped to ±$9 quintillion and the league score is worked out in
-- exact numeric maths before it's stored, so one runaway value can't break the League tab.

create or replace function public.fg_num(st jsonb, k text) returns bigint language sql immutable as $$
  select case when st ? k and (st->>k) ~ '^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$'
    then greatest(-9000000000000000000::numeric, least(9000000000000000000::numeric, round((st->>k)::numeric)))::bigint else 0 end;
$$;
create or replace function public.fg_lscore(b bigint, st jsonb) returns bigint language sql immutable as $$
  select greatest(-9000000000000000000::numeric, least(9000000000000000000::numeric,
    b::numeric - fg_num(st,'topups') - fg_num(st,'gifts') + fg_num(st,'spent') + fg_num(st,'ladj')))::bigint;
$$;
