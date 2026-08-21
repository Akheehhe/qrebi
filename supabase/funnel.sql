-- QRebi review funnel: businesses, their subscription state, and the ratings
-- their customers leave through /r/<slug>.
--
-- Run this once in the Supabase SQL editor (after schema.sql, though nothing
-- here depends on it). Then seed yourself as the admin at the bottom.
--
-- Security model, same philosophy as schema.sql:
--   · The public rating page runs with the *publishable* key and no session.
--     It can only call two security-definer functions: review_page() to read
--     the few fields the page needs, and submit_review() to write a rating.
--     The tables themselves are unreadable and unwritable to anon.
--   · Business owners sign in with a magic link. RLS matches their JWT email
--     against businesses.owner_email, so an owner sees their business and its
--     reviews and nothing else. Owners never write; the admin does.
--   · Admins are the emails in the admins table. is_admin() is the single
--     gate, used by every admin policy.

-- ── tables ────────────────────────────────────────────────────────────────

create table if not exists public.businesses (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'),
  name              text not null check (length(trim(name)) between 1 and 120),
  google_review_url text not null check (google_review_url ~* '^https://'),
  owner_email       text not null check (owner_email = lower(trim(owner_email))),
  -- subscription: active while today (Tbilisi time) is on or before this date
  paid_until        date not null default (now() at time zone 'Asia/Tbilisi')::date,
  -- ratings of at least this many stars are sent on to Google
  min_public_stars  smallint not null default 4 check (min_public_stars between 1 and 5),
  notes             text,
  created_at        timestamptz not null default now()
);

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  stars          smallint not null check (stars between 1 and 5),
  comment        text,
  author_name    text,
  author_contact text,
  -- true when the customer was passed on to the public Google review form
  sent_to_google boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists reviews_business_created
  on public.reviews (business_id, created_at desc);

create table if not exists public.admins (
  email text primary key check (email = lower(trim(email)))
);

alter table public.businesses enable row level security;
alter table public.reviews    enable row level security;
alter table public.admins     enable row level security;

-- ── the two gates ─────────────────────────────────────────────────────────

-- security definer so it can read admins, which has no policies at all
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.jwt_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ── policies ──────────────────────────────────────────────────────────────
-- admins: no policies on purpose — only is_admin() touches it.

drop policy if exists businesses_owner_read on public.businesses;
create policy businesses_owner_read on public.businesses
  for select to authenticated
  using (owner_email = public.jwt_email() or public.is_admin());

drop policy if exists businesses_admin_insert on public.businesses;
create policy businesses_admin_insert on public.businesses
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists businesses_admin_update on public.businesses;
create policy businesses_admin_update on public.businesses
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists businesses_admin_delete on public.businesses;
create policy businesses_admin_delete on public.businesses
  for delete to authenticated
  using (public.is_admin());

drop policy if exists reviews_owner_read on public.reviews;
create policy reviews_owner_read on public.reviews
  for select to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and (b.owner_email = public.jwt_email() or public.is_admin())
    )
  );
-- reviews are written only by submit_review(); nobody edits or deletes them
-- through the API.

-- ── the public rating page ────────────────────────────────────────────────

-- Everything /r/<slug> needs, and nothing else: no owner email, no notes,
-- no paid-until date. `active` is computed here so the page never has to.
create or replace function public.review_page(p_slug text)
returns table (name text, active boolean, google_review_url text, min_public_stars smallint)
language sql
security definer
set search_path = public
stable
as $$
  select b.name,
         b.paid_until >= (now() at time zone 'Asia/Tbilisi')::date,
         b.google_review_url,
         b.min_public_stars
  from public.businesses b
  where b.slug = lower(trim(p_slug));
$$;

-- One customer rating. Records it and answers whether to send the customer on
-- to Google. Inactive subscriptions record nothing — the page falls back to a
-- plain Google link and this function refuses, so a stale open tab can't keep
-- writing either.
create or replace function public.submit_review(
  p_slug    text,
  p_stars   int,
  p_comment text default null,
  p_name    text default null,
  p_contact text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b         public.businesses%rowtype;
  v_to_google boolean;
begin
  if p_stars is null or p_stars < 1 or p_stars > 5 then
    raise exception 'invalid-stars';
  end if;

  select * into v_b from public.businesses where slug = lower(trim(p_slug));
  if not found then
    raise exception 'unknown-business';
  end if;
  if v_b.paid_until < (now() at time zone 'Asia/Tbilisi')::date then
    raise exception 'inactive-business';
  end if;

  v_to_google := p_stars >= v_b.min_public_stars;

  insert into public.reviews (business_id, stars, comment, author_name, author_contact, sent_to_google)
  values (
    v_b.id,
    p_stars,
    nullif(left(trim(coalesce(p_comment, '')), 2000), ''),
    nullif(left(trim(coalesce(p_name, '')), 120), ''),
    nullif(left(trim(coalesce(p_contact, '')), 120), ''),
    v_to_google
  );

  return json_build_object(
    'ok', true,
    'to_google', v_to_google,
    'google_review_url', case when v_to_google then v_b.google_review_url end
  );
end;
$$;

revoke all on function public.review_page(text) from public;
revoke all on function public.submit_review(text, int, text, text, text) from public;
grant execute on function public.review_page(text) to anon, authenticated;
grant execute on function public.submit_review(text, int, text, text, text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.jwt_email() to authenticated;

-- ── seed your admin ───────────────────────────────────────────────────────
-- The email you sign in with at qrebi.ge/login to reach /admin:

insert into public.admins (email) values ('bozukabozi@gmail.com')
on conflict do nothing;
