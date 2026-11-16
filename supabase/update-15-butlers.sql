-- Fourth & Gold · update 15: butlers.
-- A butler standing guard (state.lodge.guardUntil, epoch ms) catches every thief until then.
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
    'outfit', them.state->'lodge'->'outfit', 'room', coalesce(them.state->'lodge'->'rooms'->'main', them.state->'lodge'->'room'), 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'home', (h->>'home')::int, 'windows', (h->>'windows')::int, 'cams', (h->>'cams')::int, 'has_safe', (h->>'safe')::bigint > 0,
    'guard', coalesce(fg_num(them.state->'lodge','guardUntil'),0) > (extract(epoch from now())*1000)::bigint,
    'tries_left', greatest(0, 10 - tries), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h2 order by h2.at desc) from (select t.name as thief, x.result, x.amount, x.at from fg_heists x join fg_players t on t.id=x.thief where x.victim = them.id order by x.at desc limit 5) h2), '[]'::json));
end $$;

-- Rob through an entry: 0 = the front door, 1.. = a window.
create or replace function public.fg_heist2(p_token uuid, p_name text, p_cracked boolean, p_entry integer) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; d json; h json; tries int; res text; amt bigint := 0; fine bigint := 0; lg uuid; catch numeric; owned jsonb;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name)) for update;
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  if tries >= 10 then return json_build_object('error','no_tries'); end if;
  if exists (select 1 from fg_heists where victim = them.id and result = 'stole' and at > now() - interval '12 hours') then return json_build_object('error','shielded'); end if;
  d := fg_defense(them.state); h := fg_home(them.state);
  if p_entry is null or p_entry < 0 or p_entry > (h->>'windows')::int then return json_build_object('error','bad_entry'); end if;
  owned := case when jsonb_typeof(them.state->'lodge'->'owned')='array' then them.state->'lodge'->'owned' else '[]'::jsonb end;
  if p_entry = 0 then
    catch := (case when owned ? 'decor_guard_dog' then 12 else 0 end) + (case when owned ? 'decor_bouncer' then 20 else 0 end);
  else
    catch := case when p_entry <= (h->>'cams')::int then 30 else 0 end;
  end if;
  catch := least(60, catch + case when owned ? 'decor_laser_grid' then 5 else 0 end);
  -- A butler standing guard catches anyone who breaks in.
  if coalesce(fg_num(them.state->'lodge','guardUntil'),0) > (extract(epoch from now())*1000)::bigint then catch := 100; end if;
  if not p_cracked then res := 'failed';
  elsif random()*100 < catch then res := 'caught';
  else res := 'stole'; end if;
  if res = 'stole' then
    amt := least(floor(greatest(them.bank - (h->>'safe')::bigint, 0) * .05 * (d->>'keep')::numeric), greatest(me.bank, 1000000))::bigint;
    if amt <= 0 then res := 'failed'; end if;
  end if;
  if res <> 'stole' then fine := greatest(10000, floor(greatest(me.bank,0) * .02))::bigint; amt := 0; end if;
  insert into fg_heists(thief, victim, result, amount) values (me.id, them.id, res, case when res='stole' then amt else fine end);
  if res = 'stole' then insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'robbed', amt, me.name);
  else insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'heist_fine', fine, me.name); end if;
  for lg in select distinct league_id from fg_league_members where player_id in (me.id, them.id) loop
    insert into fg_feed(league_id, player_id, name, kind, game, amount, n, other)
      values (lg, me.id, me.name, 'heist', res, case when res='stole' then amt else fine end, case res when 'stole' then 1 when 'caught' then 0 else 2 end, them.name);
  end loop;
  return json_build_object('ok', true, 'result', res, 'amount', amt, 'fine', fine, 'tries_left', greatest(0, 9 - tries), 'catch', catch, 'guard', catch >= 100);
end $$;

revoke all on function public.fg_home(jsonb) from public, anon, authenticated;
revoke all on function public.fg_lodge_view(uuid,text) from public;
grant execute on function public.fg_lodge_view(uuid,text) to anon, authenticated;
revoke all on function public.fg_heist2(uuid,text,boolean,integer) from public;
grant execute on function public.fg_heist2(uuid,text,boolean,integer) to anon, authenticated;
