-- Fourth & Gold update 5: custom challenge stakes (any amount up to $1 trillion instead of $5 million).
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- Run update 4 (leagues) first if you haven't.

alter table public.fg_challenges drop constraint if exists fg_challenges_stake_check;
alter table public.fg_challenges add constraint fg_challenges_stake_check check (stake between 0 and 1000000000000);

create or replace function public.fg_ch_create(p_token uuid, p_to text, p_game text, p_stake bigint, p_seed integer, p_score integer, p_data jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid; them uuid; v_id bigint;
begin
  select id into me from fg_players where token = p_token;
  if me is null then return json_build_object('error','signed_out'); end if;
  select id into them from fg_players where name_key = lower(btrim(p_to));
  if them is null or them = me then return json_build_object('error','no_player'); end if;
  if p_game not in ('golf','pick','roulette','blackjack','poker','slots','craps') then return json_build_object('error','bad_game'); end if;
  if p_stake < 0 or p_stake > 1000000000000 then return json_build_object('error','bad_stake'); end if;
  if p_game <> 'pick' and p_score is null then return json_build_object('error','no_score'); end if;
  if p_game = 'pick' and (p_data->>'gid') is null then return json_build_object('error','no_game'); end if;
  if (select count(*) from fg_challenges where from_id = me and status = 'open') >= 20 then return json_build_object('error','too_many'); end if;
  insert into fg_challenges(from_id, to_id, game, seed, stake, from_score, data)
    values (me, them, p_game, coalesce(p_seed,0), p_stake, p_score, coalesce(p_data,'{}'::jsonb)) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;
revoke all on function public.fg_ch_create(uuid,text,text,bigint,integer,integer,jsonb) from public;
grant execute on function public.fg_ch_create(uuid,text,text,bigint,integer,integer,jsonb) to anon, authenticated;
