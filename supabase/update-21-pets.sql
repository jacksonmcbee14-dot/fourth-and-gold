-- Fourth & Gold · update 21: pets and pet shows.
--  • Your pet (state.pet) is shown to visitors.
--  • fg_pet_show: enter today's dog or cat show once a day with your pet's show score; returns today's field of
--    real players' pets for that species, best first. (The app adds the lodge's regular show pets around them.)
-- Safe to run more than once.

create table if not exists public.fg_pet_shows (
  day      date not null default ((now() at time zone 'America/New_York')::date),
  species  text not null,
  player   uuid not null references public.fg_players(id) on delete cascade,
  name     text not null,
  pet      jsonb not null,
  score    int not null,
  at       timestamptz not null default now(),
  primary key (day, species, player)
);
alter table public.fg_pet_shows enable row level security;

create or replace function public.fg_pet_show(p_token uuid, p_pet jsonb, p_score int) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; sp text; d date := (now() at time zone 'America/New_York')::date;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  sp := p_pet->>'species';
  if sp not in ('dog','cat') then return json_build_object('error','bad_pet'); end if;
  if exists (select 1 from fg_pet_shows where day = d and species = sp and player = me.id) then return json_build_object('error','entered'); end if;
  insert into fg_pet_shows(day, species, player, name, pet, score)
    values (d, sp, me.id, me.name, jsonb_build_object('name', left(coalesce(p_pet->>'name','Pet'),16), 'breed', p_pet->>'breed', 'species', sp, 'tier', least(2, greatest(0, coalesce((p_pet->>'tier')::int,0)))), least(100000, greatest(0, p_score)));
  return json_build_object('ok', true, 'field', (select json_agg(json_build_object('owner', s.name, 'pet', s.pet, 'score', s.score, 'me', s.player = me.id) order by s.score desc) from fg_pet_shows s where s.day = d and s.species = sp));
end $$;

-- Today's results without entering (to see the field).
create or replace function public.fg_pet_field(p_token uuid, p_species text) returns json
language sql security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('owner', s.name, 'pet', s.pet, 'score', s.score, 'me', s.player = (select id from fg_players where token = p_token)) order by s.score desc), '[]'::json)
  from fg_pet_shows s where s.day = (now() at time zone 'America/New_York')::date and s.species = p_species;
$$;

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
    'outfit', them.state->'lodge'->'outfit', 'pet', them.state->'pet', 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'),
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

revoke all on function public.fg_pet_show(uuid,jsonb,int) from public;
grant execute on function public.fg_pet_show(uuid,jsonb,int) to anon, authenticated;
revoke all on function public.fg_pet_field(uuid,text) from public;
grant execute on function public.fg_pet_field(uuid,text) to anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
