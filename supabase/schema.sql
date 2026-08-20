-- QRebi offer signups.
--
-- Run this once in the Supabase SQL editor.
--
-- The site holds only the *publishable* key, so RLS stays on and the table has
-- no policies at all: nothing can read or write it through the API. Signups go
-- through claim_offer_code(), a security-definer function, which is the only
-- thing exposed. That way the email list can never be read back out, and a
-- repeat signup returns the code already issued instead of erroring.

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  business   text,
  code       text not null unique,
  source     text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
-- deliberately no policies: only the function below may touch this table

create or replace function public.claim_offer_code(p_email text, p_business text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code     text;
  v_existing text;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no O/0, I/1
begin
  p_email := lower(trim(p_email));
  if p_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'invalid-email';
  end if;

  select code into v_existing from public.subscribers where email = p_email;
  if v_existing is not null then
    return v_existing;
  end if;

  loop
    v_code := 'QR-' || (
      select string_agg(substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1), '')
      from generate_series(1, 6)
    );
    exit when not exists (select 1 from public.subscribers where code = v_code);
  end loop;

  insert into public.subscribers (email, business, code)
  values (p_email, nullif(trim(coalesce(p_business, '')), ''), v_code);

  return v_code;
end;
$$;

revoke all on function public.claim_offer_code(text, text) from public;
grant execute on function public.claim_offer_code(text, text) to anon, authenticated;
