-- Fourth & Gold · update 20: send money to another player.
-- The sender's app takes the money out after the server says yes; it arrives in the other player's inbox
-- (kind money_gift) and counts as a gift, so it can't be used to pad a league score.
-- Safe to run more than once.

create table if not exists public.fg_sends (
  id      bigserial primary key,
  sender  uuid not null references public.fg_players(id) on delete cascade,
  target  uuid not null references public.fg_players(id) on delete cascade,
  amount  bigint not null,
  at      timestamptz not null default now()
);
create index if not exists fg_sends_sender on public.fg_sends(sender, at desc);
alter table public.fg_sends enable row level security;

create or replace function public.fg_send(p_token uuid, p_name text, p_amount bigint) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; them fg_players;
begin
  select * into me from fg_players where token = p_token for update;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into them from fg_players where name_key = lower(btrim(p_name));
  if not found or them.id = me.id then return json_build_object('error','no_player'); end if;
  if p_amount is null or p_amount < 1 then return json_build_object('error','bad_amount'); end if;
  if p_amount > me.bank then return json_build_object('error','too_much'); end if;
  -- take it off the sender's saved bankroll now, so the same money can't be sent twice before the next save
  update fg_players set bank = bank - p_amount where id = me.id;
  insert into fg_sends(sender, target, amount) values (me.id, them.id, p_amount);
  insert into fg_inbox(player_id, kind, amount, label) values (them.id, 'money_gift', p_amount, me.name);
  return json_build_object('ok', true, 'amount', p_amount, 'to', them.name);
end $$;

revoke all on function public.fg_send(uuid,text,bigint) from public;
grant execute on function public.fg_send(uuid,text,bigint) to anon, authenticated;
