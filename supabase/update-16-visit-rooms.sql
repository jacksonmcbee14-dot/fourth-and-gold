-- Fourth & Gold · update 16: visitors can look around every room of someone's home except the vault room.
-- Safe to run more than once.

create or replace function public.fg_lodge_view(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; tries int; shield timestamptz; h json;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  select max(at) + interval '12 hours' into shield from fg_heists where victim = them.id and result = 'stole';
  h := fg_home(them.state);
  return json_build_object('name', them.name, 'me', them.id = me.id,
    'outfit', them.state->'lodge'->'outfit', 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'),
    'rooms', case when jsonb_typeof(them.state->'lodge'->'rooms')='object' then (them.state->'lodge'->'rooms') - 'vault' else '{}'::jsonb end, 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'home', (h->>'home')::int, 'windows', (h->>'windows')::int, 'cams', (h->>'cams')::int, 'has_safe', (h->>'safe')::bigint > 0,
    'guard', coalesce(fg_num(them.state->'lodge','guardUntil'),0) > (extract(epoch from now())*1000)::bigint,
    'tries_left', greatest(0, 10 - tries), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h2 order by h2.at desc) from (select t.name as thief, x.result, x.amount, x.at from fg_heists x join fg_players t on t.id=x.thief where x.victim = them.id order by x.at desc limit 5) h2), '[]'::json));
end $$;

revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
