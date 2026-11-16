-- Fourth & Gold update 13: 10 robbery attempts a day (was 3).
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once. Needs update 7 first.

create or replace function public.fg_lodge_view(p_token uuid, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; tries int; shield timestamptz;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  select max(at) + interval '12 hours' into shield from fg_heists where victim = them.id and result = 'stole';
  return json_build_object('name', them.name, 'me', them.id = me.id,
    'outfit', them.state->'lodge'->'outfit', 'room', them.state->'lodge'->'room', 'xp', coalesce((them.state->'lodge'->>'xp')::numeric,0)::bigint,
    'vip', them.state->>'vipBest', 'vipIdx', fg_vipidx(them.state), 'myVipIdx', fg_vipidx(me.state),
    'bank', them.bank, 'defense', fg_defense(them.state),
    'tries_left', greatest(0, 10 - tries), 'shield_until', case when shield > now() then shield end,
    'recent', coalesce((select json_agg(h order by h.at desc) from (select t.name as thief, h.result, h.amount, h.at from fg_heists h join fg_players t on t.id=h.thief where h.victim = them.id order by h.at desc limit 5) h), '[]'::json));
end $$;

create or replace function public.fg_heist(p_token uuid, p_name text, p_cracked boolean) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players; d json; tries int; res text; amt bigint := 0; fine bigint := 0; lg uuid;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name)) for update;
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  select count(*) into tries from fg_heists where thief = me.id and at > now() - interval '24 hours';
  if tries >= 10 then return json_build_object('error','no_tries'); end if;
  if exists (select 1 from fg_heists where victim = them.id and result = 'stole' and at > now() - interval '12 hours') then return json_build_object('error','shielded'); end if;
  d := fg_defense(them.state);
  if not p_cracked then res := 'failed';
  elsif random()*100 < (d->>'catch')::numeric then res := 'caught';
  else res := 'stole'; end if;
  if res = 'stole' then
    amt := least(floor(greatest(them.bank,0) * .05 * (d->>'keep')::numeric), greatest(me.bank, 1000000))::bigint;
    if amt <= 0 then res := 'failed'; end if;
  end if;
  if res <> 'stole' then fine := greatest(10000, floor(greatest(me.bank,0) * .02))::bigint; amt := 0; end if;
  insert into fg_heists(thief, victim, result, amount) values (me.id, them.id, res, case when res='stole' then amt else fine end);
  if res = 'stole' then
    insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'robbed', amt, me.name);
  else
    insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'heist_fine', fine, me.name);
  end if;
  for lg in select distinct league_id from fg_league_members where player_id in (me.id, them.id) loop
    insert into fg_feed(league_id, player_id, name, kind, game, amount, n, other)
      values (lg, me.id, me.name, 'heist', res, case when res='stole' then amt else fine end, case res when 'stole' then 1 when 'caught' then 0 else 2 end, them.name);
  end loop;
  return json_build_object('ok', true, 'result', res, 'amount', amt, 'fine', fine, 'tries_left', greatest(0, 9 - tries));
end $$;
