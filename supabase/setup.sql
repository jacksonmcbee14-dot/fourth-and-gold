-- Fourth & Gold: player profiles and leaderboard.
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run.
-- Safe to run again: it only creates what's missing and replaces the functions.
--
-- Players can't read or change the table directly. The app can only call the
-- functions below, which check the PIN (stored scrambled with bcrypt) and only
-- ever hand back public leaderboard columns.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.fg_players (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 20),
  name_key     text generated always as (lower(btrim(name))) stored unique,
  pin_hash     text not null,
  token        uuid not null default gen_random_uuid(),
  bank         bigint not null default 1000000,
  peak         bigint not null default 1000000,
  resets       integer not null default 0,
  nfl_team     text,
  cfb_team     text,
  state        jsonb,
  state_upd    bigint not null default 0,
  failed       integer not null default 0,
  locked_until timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.fg_players enable row level security;   -- no policies: no direct access
revoke all on table public.fg_players from anon, authenticated;

-- Create a profile. Returns {token} or {error:'name_taken'|'bad_name'|'bad_pin'}.
create or replace function public.fg_signup(p_name text, p_pin text, p_state jsonb, p_upd bigint,
  p_bank bigint, p_peak bigint, p_resets integer, p_nfl text, p_cfb text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_token uuid; v_name text := btrim(p_name);
begin
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 20 then return json_build_object('error','bad_name'); end if;
  if p_pin !~ '^[0-9]{4}$' then return json_build_object('error','bad_pin'); end if;
  if exists (select 1 from fg_players where name_key = lower(v_name)) then return json_build_object('error','name_taken'); end if;
  insert into fg_players(name, pin_hash, state, state_upd, bank, peak, resets, nfl_team, cfb_team)
  values (v_name, crypt(p_pin, gen_salt('bf')), p_state, coalesce(p_upd,0), coalesce(p_bank,1000000),
          coalesce(p_peak,1000000), coalesce(p_resets,0), p_nfl, p_cfb)
  returning token into v_token;
  return json_build_object('token', v_token, 'name', v_name);
end $$;

-- Sign in on any device. Returns {token,name,state,upd} or {error:'no_player'|'bad_pin'|'locked'}.
-- 8 wrong PINs in a row lock that name for 15 minutes.
create or replace function public.fg_login(p_name text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare r fg_players;
begin
  select * into r from fg_players where name_key = lower(btrim(p_name));
  if not found then return json_build_object('error','no_player'); end if;
  if r.locked_until is not null and r.locked_until > now() then return json_build_object('error','locked'); end if;
  if r.pin_hash <> crypt(coalesce(p_pin,''), r.pin_hash) then
    update fg_players set
      locked_until = case when failed + 1 >= 8 then now() + interval '15 minutes' else locked_until end,
      failed = case when failed + 1 >= 8 then 0 else failed + 1 end
    where id = r.id;
    return json_build_object('error','bad_pin');
  end if;
  update fg_players set failed = 0, locked_until = null where id = r.id;
  return json_build_object('token', r.token, 'name', r.name, 'state', r.state, 'upd', r.state_upd);
end $$;

-- Load the saved game for a signed-in device.
create or replace function public.fg_load(p_token uuid)
returns json language sql security definer set search_path = public as $$
  select json_build_object('name', name, 'state', state, 'upd', state_upd) from fg_players where token = p_token;
$$;

-- Save the game. Older saves never overwrite newer ones.
create or replace function public.fg_save(p_token uuid, p_state jsonb, p_upd bigint, p_bank bigint,
  p_peak bigint, p_resets integer, p_nfl text, p_cfb text)
returns json language plpgsql security definer set search_path = public as $$
begin
  update fg_players set state = p_state, state_upd = p_upd, bank = p_bank, peak = greatest(peak, p_peak),
    resets = p_resets, nfl_team = p_nfl, cfb_team = p_cfb, updated_at = now()
  where token = p_token and p_upd >= state_upd;
  if found then return json_build_object('ok', true); end if;
  if exists (select 1 from fg_players where token = p_token) then return json_build_object('ok', false, 'stale', true); end if;
  return json_build_object('error', 'signed_out');
end $$;

-- Public leaderboard: most money first, fewer resets break ties, with casino / football split.
-- (Same as the latest supabase/update-*.sql.)
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

revoke all on function public.fg_signup(text,text,jsonb,bigint,bigint,bigint,integer,text,text) from public;
revoke all on function public.fg_login(text,text) from public;
revoke all on function public.fg_load(uuid) from public;
revoke all on function public.fg_save(uuid,jsonb,bigint,bigint,bigint,integer,text,text) from public;
revoke all on function public.fg_leaderboard() from public;
grant execute on function public.fg_signup(text,text,jsonb,bigint,bigint,bigint,integer,text,text) to anon, authenticated;
grant execute on function public.fg_login(text,text) to anon, authenticated;
grant execute on function public.fg_load(uuid) to anon, authenticated;
grant execute on function public.fg_save(uuid,jsonb,bigint,bigint,bigint,integer,text,text) to anon, authenticated;
grant execute on function public.fg_leaderboard() to anon, authenticated;
