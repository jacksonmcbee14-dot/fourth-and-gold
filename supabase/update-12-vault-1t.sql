-- Fourth & Gold update 12: the vault is now $1 trillion. Bankrolls above it are trimmed to it.
-- Paste into Supabase → SQL Editor → New query, then click Run. Safe to run more than once.
update public.fg_players set bank = 1000000000000,
  state = jsonb_set(jsonb_set(state, '{bank}', '1000000000000'::jsonb), '{peak}', '1000000000000'::jsonb)
  where bank > 1000000000000 and state is not null and (state->>'bank')::numeric > 1000000000000;
