-- Fourth & Gold · update 23: steal furniture.
-- After a successful robbery (within 10 minutes) the thief can take ONE piece of decor the victim owns.
-- The victim's app removes it (inbox kind item_stolen); the thief's app adds it with a "stolen from" tag.
-- Visitors see stolen tags (state.lodge.stolen). Safe to run more than once.

alter table public.fg_heists add column if not exists item text;

create or replace function public.fg_steal_item(p_token uuid, p_name text, p_item text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; hid bigint;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  if p_item is null or p_item not like 'decor\_%' then return json_build_object('error','bad_item'); end if;
  if not (coalesce(them.state->'lodge'->'owned','[]'::jsonb) ? p_item) then return json_build_object('error','not_owned'); end if;
  select id into hid from fg_heists where thief = me.id and victim = them.id and result = 'stole' and item is null and at > now() - interval '10 minutes' order by at desc limit 1 for update;
  if hid is null then return json_build_object('error','no_heist'); end if;
  update fg_heists set item = p_item where id = hid;
  insert into fg_inbox(player_id, kind, amount, label, item) values (them.id, 'item_stolen', 0, me.name, p_item);
  return json_build_object('ok', true, 'item', p_item);
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
    'outfit', them.state->'lodge'->'outfit', 'pet', them.state->'pet', 'tiers', them.state->'lodge'->'tiers', 'stolen', them.state->'lodge'->'stolen', 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'),
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

revoke all on function public.fg_steal_item(uuid,text,text) from public;
grant execute on function public.fg_steal_item(uuid,text,text) to anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
