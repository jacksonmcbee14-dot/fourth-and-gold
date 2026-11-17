-- Fourth & Gold · update 27: pet walks in the park.
--  • fg_walk_submit: your best walk score today (bones collected), with your pet and outfit for the park.
--  • fg_walk_park: today's best walks and a few other players (with pets) to wander the park with you.
-- Safe to run more than once.

create table if not exists public.fg_walks (
  day     date not null default ((now() at time zone 'America/New_York')::date),
  player  uuid not null references public.fg_players(id) on delete cascade,
  name    text not null,
  pet     jsonb,
  outfit  jsonb,
  score   int not null default 0,
  at      timestamptz not null default now(),
  primary key (day, player)
);
alter table public.fg_walks enable row level security;

create or replace function public.fg_walk_submit(p_token uuid, p_score int) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; d date := (now() at time zone 'America/New_York')::date;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  insert into fg_walks(day, player, name, pet, outfit, score) values (d, me.id, me.name, me.state->'pet', me.state->'lodge'->'outfit', least(500, greatest(0, p_score)))
    on conflict (day, player) do update set score = greatest(fg_walks.score, excluded.score), pet = excluded.pet, outfit = excluded.outfit, at = now();
  return json_build_object('ok', true, 'rank', (select count(*) + 1 from fg_walks where day = d and score > least(500, greatest(0, p_score))));
end $$;

create or replace function public.fg_walk_park(p_token uuid) returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'top', coalesce((select json_agg(json_build_object('name', w.name, 'score', w.score, 'pet', w.pet, 'me', p.token = p_token) order by w.score desc, w.at)
            from (select * from fg_walks where day = (now() at time zone 'America/New_York')::date order by score desc limit 10) w join fg_players p on p.id = w.player), '[]'::json),
    'walkers', coalesce((select json_agg(json_build_object('name', x.name, 'pet', x.state->'pet', 'outfit', x.state->'lodge'->'outfit'))
            from (select name, state from fg_players where token <> p_token and jsonb_typeof(state->'pet') = 'object' order by updated_at desc limit 8) x), '[]'::json));
$$;

revoke all on function public.fg_walk_submit(uuid,int) from public;  grant execute on function public.fg_walk_submit(uuid,int) to anon, authenticated;
revoke all on function public.fg_walk_park(uuid) from public;        grant execute on function public.fg_walk_park(uuid) to anon, authenticated;
