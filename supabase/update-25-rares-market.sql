-- Fourth & Gold · update 25: numbered monthly rares and the player market.
--  • Rares: each month has three pieces, only 10 of each ever (serials #1–#10). fg_rare_buy hands out the next serial
--    during that month only; after that they're retired. fg_rare_stock shows how many are left.
--  • Market: list something you own for a price; another player buys it. The server takes the money off the buyer's
--    saved bankroll, tells the seller (inbox kind market_sold), and moves a rare's serial to the new owner.
-- Safe to run more than once.

create table if not exists public.fg_rares (
  item    text not null,
  serial  int not null,
  owner   uuid references public.fg_players(id) on delete set null,
  month   text not null,
  at      timestamptz not null default now(),
  primary key (item, serial)
);
alter table public.fg_rares enable row level security;

create table if not exists public.fg_market (
  id       bigserial primary key,
  seller   uuid not null references public.fg_players(id) on delete cascade,
  item     text not null,
  price    bigint not null,
  serial   int,
  at       timestamptz not null default now(),
  buyer    uuid references public.fg_players(id) on delete set null,
  sold_at  timestamptz,
  closed   boolean not null default false
);
create index if not exists fg_market_open on public.fg_market(at desc) where not closed;
alter table public.fg_market enable row level security;

create or replace function public.fg_month() returns text language sql stable as $$ select to_char(now() at time zone 'America/New_York', 'YYYYMM'); $$;

create or replace function public.fg_rare_buy(p_token uuid, p_item text) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; n int;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if p_item !~ ('^decor_rare_[a-z]+_' || fg_month() || '$') then return json_build_object('error','retired'); end if;
  perform pg_advisory_xact_lock(hashtext(p_item));
  if exists (select 1 from fg_rares where item = p_item and owner = me.id) then return json_build_object('error','have'); end if;
  select count(*) into n from fg_rares where item = p_item;
  if n >= 10 then return json_build_object('error','sold_out'); end if;
  insert into fg_rares(item, serial, owner, month) values (p_item, n + 1, me.id, fg_month());
  return json_build_object('ok', true, 'serial', n + 1);
end $$;

create or replace function public.fg_rare_stock(p_items text[]) returns json
language sql security definer set search_path = public as $$
  select coalesce(json_object_agg(i, (select count(*) from fg_rares r where r.item = i)), '{}'::json) from unnest(p_items) i;
$$;

create or replace function public.fg_market_list(p_token uuid, p_item text, p_price bigint) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; s int;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  if p_price is null or p_price < 1 then return json_build_object('error','bad_price'); end if;
  if not (coalesce(me.state->'lodge'->'owned','[]'::jsonb) ? p_item) then return json_build_object('error','not_owned'); end if;
  if exists (select 1 from fg_market where seller = me.id and item = p_item and not closed) then return json_build_object('error','listed'); end if;
  if (select count(*) from fg_market where seller = me.id and not closed) >= 10 then return json_build_object('error','too_many'); end if;
  select serial into s from fg_rares where item = p_item and owner = me.id limit 1;
  insert into fg_market(seller, item, price, serial) values (me.id, p_item, p_price, s);
  return json_build_object('ok', true);
end $$;

create or replace function public.fg_market_cancel(p_token uuid, p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players;
begin
  select * into me from fg_players where token = p_token;
  if not found then return json_build_object('error','signed_out'); end if;
  update fg_market set closed = true where id = p_id and seller = me.id and not closed;
  return json_build_object('ok', found);
end $$;

create or replace function public.fg_market_browse(p_token uuid) returns json
language sql security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', m.id, 'item', m.item, 'price', m.price, 'serial', m.serial, 'seller', p.name,
           'mine', p.token = p_token, 'at', m.at) order by m.at desc), '[]'::json)
  from (select * from fg_market where not closed order by at desc limit 80) m join fg_players p on p.id = m.seller;
$$;

create or replace function public.fg_market_buy(p_token uuid, p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare me fg_players; l fg_market; sel fg_players;
begin
  select * into me from fg_players where token = p_token for update;
  if not found then return json_build_object('error','signed_out'); end if;
  select * into l from fg_market where id = p_id for update;
  if not found or l.closed then return json_build_object('error','gone'); end if;
  if l.seller = me.id then return json_build_object('error','yours'); end if;
  if l.price > me.bank then return json_build_object('error','too_much'); end if;
  select * into sel from fg_players where id = l.seller;
  if not (coalesce(sel.state->'lodge'->'owned','[]'::jsonb) ? l.item) then update fg_market set closed = true where id = l.id; return json_build_object('error','gone'); end if;
  update fg_players set bank = bank - l.price where id = me.id;
  update fg_market set closed = true, buyer = me.id, sold_at = now() where id = l.id;
  update fg_rares set owner = me.id where item = l.item and owner = l.seller;
  insert into fg_inbox(player_id, kind, amount, label, item) values (l.seller, 'market_sold', l.price, me.name, l.item);
  return json_build_object('ok', true, 'item', l.item, 'serial', l.serial, 'price', l.price, 'seller', sel.name);
end $$;

revoke all on function public.fg_rare_buy(uuid,text) from public;            grant execute on function public.fg_rare_buy(uuid,text) to anon, authenticated;
revoke all on function public.fg_rare_stock(text[]) from public;             grant execute on function public.fg_rare_stock(text[]) to anon, authenticated;
revoke all on function public.fg_market_list(uuid,text,bigint) from public;  grant execute on function public.fg_market_list(uuid,text,bigint) to anon, authenticated;
revoke all on function public.fg_market_cancel(uuid,bigint) from public;     grant execute on function public.fg_market_cancel(uuid,bigint) to anon, authenticated;
revoke all on function public.fg_market_browse(uuid) from public;            grant execute on function public.fg_market_browse(uuid) to anon, authenticated;
revoke all on function public.fg_market_buy(uuid,bigint) from public;        grant execute on function public.fg_market_buy(uuid,bigint) to anon, authenticated;
