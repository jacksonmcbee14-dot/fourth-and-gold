-- Fourth & Gold · update 18: hot tubs are for everyone.
--  • Visit someone who owns a hot tub and get in: +10% XP for 30 minutes, once a day per friend's tub.
--  • The owner gets a thank-you (XP) each time a friend gets in.
--  • Hot tub party: two or more friends in the same tub within an hour boosts everyone in it (+20%, then +30%).
-- Safe to run more than once.

create table if not exists public.fg_soaks (
  id     bigserial primary key,
  guest  uuid not null references public.fg_players(id) on delete cascade,
  host   uuid not null references public.fg_players(id) on delete cascade,
  at     timestamptz not null default now()
);
create index if not exists fg_soaks_host on public.fg_soaks(host, at desc);
create index if not exists fg_soaks_guest on public.fg_soaks(guest, at desc);
alter table public.fg_soaks enable row level security;

create or replace function public.fg_soak(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; n int; names json; g record;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  if not (coalesce(them.state->'lodge'->'owned','[]'::jsonb) ? 'decor_hottub') then return json_build_object('error','no_tub'); end if;
  if exists (select 1 from fg_soaks where guest = me.id and host = them.id and at > now() - interval '20 hours') then return json_build_object('error','already'); end if;
  insert into fg_soaks(guest, host) values (me.id, them.id);
  select count(distinct guest), json_agg(distinct p.name) into n, names
    from fg_soaks s join fg_players p on p.id = s.guest where s.host = them.id and s.at > now() - interval '1 hour';
  insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'tub_guest', n, me.name);
  if n >= 2 then
    for g in select distinct guest from fg_soaks where host = them.id and at > now() - interval '1 hour' and guest <> me.id loop
      insert into fg_inbox(player_id, kind, amount, label) values (g.guest, 'tub_party', n, them.name);
    end loop;
  end if;
  return json_build_object('ok', true, 'party', n, 'names', names);
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
    'outfit', them.state->'lodge'->'outfit', 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'),
    'rooms', case when jsonb_typeof(them.state->'lodge'->'rooms')='object' then (them.state->'lodge'->'rooms') - 'vault' else '{}'::jsonb end, 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'home', (h->>'home')::int, 'windows', (h->>'windows')::int, 'cams', (h->>'cams')::int, 'has_safe', (h->>'safe')::bigint > 0,
    'guard', coalesce(fg_num(them.state->'lodge','guardUntil'),0) > (extract(epoch from now())*1000)::bigint,
    'has_tub', coalesce(them.state->'lodge'->'owned','[]'::jsonb) ? 'decor_hottub',
    'tub_now', coalesce((select json_agg(g.name order by s.at) from fg_soaks s join fg_players g on g.id = s.guest where s.host = them.id and s.at > now() - interval '1 hour'), '[]'::json),
    'soaked_today', exists (select 1 from fg_soaks where guest = me.id and host = them.id and at > now() - interval '20 hours'),
    'tries_left', greatest(0, 10 - tries), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h2 order by h2.at desc) from (select t.name as thief, x.result, x.amount, x.at from fg_heists x join fg_players t on t.id=x.thief where x.victim = them.id order by x.at desc limit 5) h2), '[]'::json));
end $$;

revoke all on function public.fg_soak(uuid,text) from public;
grant execute on function public.fg_soak(uuid,text) to anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
