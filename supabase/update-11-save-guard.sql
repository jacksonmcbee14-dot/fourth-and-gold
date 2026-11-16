-- Fourth & Gold update 11: a stale phone can't overwrite someone's progress.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
-- XP only ever goes up (resets and Prestige keep it), so a save carrying much less XP than the server has
-- must come from an old copy of the game. It's refused as stale, and the app loads the server's copy instead.

create or replace function public.fg_save(p_token uuid, p_state jsonb, p_upd bigint, p_bank bigint,
  p_peak bigint, p_resets integer, p_nfl text, p_cfb text)
returns json language plpgsql security definer set search_path = public as $$
declare old fg_players;
begin
  select * into old from fg_players where token = p_token;
  if not found then return json_build_object('error', 'signed_out'); end if;
  if p_upd < old.state_upd then return json_build_object('ok', false, 'stale', true); end if;
  if fg_num(p_state->'lodge', 'xp') + 500 < fg_num(old.state->'lodge', 'xp') then
    return json_build_object('ok', false, 'stale', true, 'why', 'less_xp');
  end if;
  update fg_players set state = p_state, state_upd = p_upd, bank = p_bank, peak = greatest(peak, p_peak),
    resets = p_resets, nfl_team = p_nfl, cfb_team = p_cfb, updated_at = now()
  where id = old.id;
  return json_build_object('ok', true);
end $$;
revoke all on function public.fg_save(uuid,jsonb,bigint,bigint,bigint,integer,text,text) from public;
grant execute on function public.fg_save(uuid,jsonb,bigint,bigint,bigint,integer,text,text) to anon, authenticated;
