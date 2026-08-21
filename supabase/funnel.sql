-- QRebi review funnel: businesses, their subscription state, and the ratings
-- their customers leave through /r/<slug>.
--
-- Run this in the Supabase SQL editor (after schema.sql, though nothing here
-- depends on it). Safe to re-run: an install created from an older version of
-- this file is upgraded in place by the ALTER block below. Then seed yourself
-- as the admin at the bottom.
--
-- Security model, same philosophy as schema.sql:
--   · The public rating page runs with the *publishable* key and no session.
--     It can only call security-definer functions: review_page() to read the
--     few fields the page needs, submit_review()/add_feedback() to write one
--     rating. The tables themselves are unreadable and unwritable to anon.
--   · Business owners sign in with a magic link. RLS matches their JWT email
--     against businesses.owner_email, so an owner sees their business and its
--     reviews and nothing else. Owners write nothing except the handled tick;
--     the admin does the rest.
--   · Admins are the emails in the admins table. is_admin() is the single
--     gate, used by every admin policy.
--
-- Platforms: a business points at up to three public review destinations —
-- Google, Tripadvisor, Booking. Google and Tripadvisor have public
-- write-a-review URLs; Booking has none (only real guests can review, via
-- Booking's own post-stay email), so its URL is the property page.

-- ── tables ────────────────────────────────────────────────────────────────

create table if not exists public.businesses (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'),
  name              text not null check (length(trim(name)) between 1 and 120),
  google_review_url text,
  tripadvisor_url   text,
  booking_url       text,
  -- a real, lowercase address: '' must never be valid, because a JWT with no
  -- email claim (phone/anonymous auth) normalizes to null/'' on the other side
  owner_email       text not null
                    check (owner_email = lower(trim(owner_email))
                       and owner_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- subscription: active while today (Tbilisi time) is on or before this date
  paid_until        date not null default (now() at time zone 'Asia/Tbilisi')::date,
  -- ratings of at least this many stars are sent on to a public platform
  min_public_stars  smallint not null default 4 check (min_public_stars between 1 and 5),
  created_at        timestamptz not null default now()
);

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  stars          smallint not null check (stars between 1 and 5),
  comment        text,
  author_name    text,
  author_contact text,
  -- true when the customer was passed on to a public review platform
  -- (the column predates Tripadvisor/Booking support, hence the name)
  sent_to_google boolean not null default false,
  -- which platform they were sent to; null while private or undecided
  platform       text,
  -- set by the owner when they consider a piece of feedback dealt with
  handled_at     timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists reviews_business_created
  on public.reviews (business_id, created_at desc);

create table if not exists public.admins (
  email text primary key check (email = lower(trim(email)))
);

-- upgrades for installs created from an earlier version of this file;
-- no-ops on a fresh one
alter table public.businesses add column if not exists tripadvisor_url text;
alter table public.businesses add column if not exists booking_url text;
alter table public.businesses alter column google_review_url drop not null;
alter table public.reviews    add column if not exists platform text;
alter table public.reviews    add column if not exists handled_at timestamptz;

-- constraints for the platform columns, stated once for both paths
alter table public.businesses drop constraint if exists businesses_google_review_url_check;
alter table public.businesses add constraint businesses_google_review_url_check
  check (google_review_url is null or google_review_url ~* '^https://');
alter table public.businesses drop constraint if exists businesses_tripadvisor_url_https;
alter table public.businesses add constraint businesses_tripadvisor_url_https
  check (tripadvisor_url is null or tripadvisor_url ~* '^https://');
alter table public.businesses drop constraint if exists businesses_booking_url_https;
alter table public.businesses add constraint businesses_booking_url_https
  check (booking_url is null or booking_url ~* '^https://');
alter table public.businesses drop constraint if exists businesses_platform_present;
alter table public.businesses add constraint businesses_platform_present
  check (coalesce(google_review_url, tripadvisor_url, booking_url) is not null);
alter table public.reviews drop constraint if exists reviews_platform_allowed;
alter table public.reviews add constraint reviews_platform_allowed
  check (platform is null or platform in ('google', 'tripadvisor', 'booking'));

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

-- null (never '') when the JWT carries no email claim, so the owner-read
-- policy's equality can never match a row by accident
create or replace function public.jwt_email()
returns text
language sql
stable
as $$
  select nullif(lower(trim(coalesce(auth.jwt() ->> 'email', ''))), '');
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
-- reviews are written only by submit_review()/add_feedback(); the sole edit
-- the API allows is the owner's handled tick, through its own function.

-- ── the public rating page ────────────────────────────────────────────────

-- The business's configured destinations, in a fixed display order.
create or replace function public.business_platforms(b public.businesses)
returns json
language sql
stable
as $$
  select coalesce(json_agg(json_build_object('key', p.key, 'url', p.url)), '[]'::json)
  from (values ('google',      (b).google_review_url),
               ('tripadvisor', (b).tripadvisor_url),
               ('booking',     (b).booking_url)) as p(key, url)
  where p.url is not null;
$$;

-- Everything /r/<slug> needs, and nothing else: no owner email, no paid-until
-- date. `active` is computed here so the page never has to.
drop function if exists public.review_page(text);
create function public.review_page(p_slug text)
returns table (name text, active boolean, min_public_stars smallint, platforms json)
language sql
security definer
set search_path = public
stable
as $$
  select b.name,
         b.paid_until >= (now() at time zone 'Asia/Tbilisi')::date,
         b.min_public_stars,
         public.business_platforms(b)
  from public.businesses b
  where b.slug = lower(trim(p_slug));
$$;

-- p_platform must be one the business actually has configured
create or replace function public.assert_platform(b public.businesses, p_platform text)
returns void
language plpgsql
as $$
begin
  if p_platform is null then
    return;
  end if;
  if (p_platform = 'google'      and (b).google_review_url is not null)
  or (p_platform = 'tripadvisor' and (b).tripadvisor_url   is not null)
  or (p_platform = 'booking'     and (b).booking_url       is not null) then
    return;
  end if;
  raise exception 'invalid-platform';
end;
$$;

-- One customer rating. Records it and answers whether — and where — to send
-- the customer on. Inactive subscriptions record nothing: the page falls back
-- to plain platform links and this function refuses, so a stale open tab
-- can't keep writing either.
drop function if exists public.submit_review(text, int, text, text, text);
create or replace function public.submit_review(
  p_slug     text,
  p_stars    int,
  p_comment  text default null,
  p_name     text default null,
  p_contact  text default null,
  p_platform text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b         public.businesses%rowtype;
  v_to        boolean;
  v_platforms json;
  v_platform  text;
  v_id        uuid;
begin
  if p_stars is null or p_stars < 1 or p_stars > 5 then
    raise exception 'invalid-stars';
  end if;

  select * into v_b from public.businesses where slug = lower(trim(p_slug));
  -- one indistinguishable refusal for a slug that doesn't exist and one whose
  -- subscription lapsed: nothing extra to learn by probing
  if not found or v_b.paid_until < (now() at time zone 'Asia/Tbilisi')::date then
    raise exception 'not-available';
  end if;
  perform public.assert_platform(v_b, p_platform);

  -- even a busy counter yields at most a couple of taps a minute; hundreds
  -- an hour means a script is flooding the inbox — refuse rather than store
  if (select count(*) from public.reviews
      where business_id = v_b.id
        and created_at > now() - interval '1 hour') >= 120 then
    raise exception 'not-available';
  end if;

  v_to := p_stars >= v_b.min_public_stars;
  v_platforms := public.business_platforms(v_b);
  -- with a single destination the choice makes itself
  v_platform := case
    when not v_to then null
    when p_platform is not null then p_platform
    when json_array_length(v_platforms) = 1 then v_platforms -> 0 ->> 'key'
  end;

  insert into public.reviews (business_id, stars, comment, author_name, author_contact,
                              sent_to_google, platform)
  values (
    v_b.id,
    p_stars,
    nullif(left(trim(coalesce(p_comment, '')), 2000), ''),
    nullif(left(trim(coalesce(p_name, '')), 120), ''),
    nullif(left(trim(coalesce(p_contact, '')), 120), ''),
    v_to,
    v_platform
  )
  returning id into v_id;

  -- review_id lets the same visit amend this row through add_feedback():
  -- the star is stored the moment it is tapped; the comment, a changed pick,
  -- or the platform choice arrive after
  return json_build_object(
    'ok', true,
    'review_id', v_id,
    'to_public', v_to,
    'platforms', case when v_to then v_platforms end
  );
end;
$$;

-- The second half of a visit: the tap already wrote the row (so an abandoned
-- form still counts), this fills in the comment, re-scores a changed pick, or
-- stamps which platform the customer chose. Only the visitor who made the row
-- knows its uuid, and only for a day.
drop function if exists public.add_feedback(uuid, int, text, text, text);
create or replace function public.add_feedback(
  p_review_id uuid,
  p_stars     int  default null,
  p_comment   text default null,
  p_name      text default null,
  p_contact   text default null,
  p_platform  text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_r     public.reviews%rowtype;
  v_b     public.businesses%rowtype;
  v_stars int;
  v_to    boolean;
begin
  if p_stars is not null and (p_stars < 1 or p_stars > 5) then
    raise exception 'invalid-stars';
  end if;

  select * into v_r from public.reviews
  where id = p_review_id and created_at > now() - interval '1 day';
  if not found then
    raise exception 'not-available';
  end if;

  select * into v_b from public.businesses where id = v_r.business_id;
  if not found or v_b.paid_until < (now() at time zone 'Asia/Tbilisi')::date then
    raise exception 'not-available';
  end if;
  perform public.assert_platform(v_b, p_platform);

  v_stars := coalesce(p_stars, v_r.stars);
  v_to := v_stars >= v_b.min_public_stars;

  update public.reviews set
    stars          = v_stars,
    comment        = coalesce(nullif(left(trim(coalesce(p_comment, '')), 2000), ''), comment),
    author_name    = coalesce(nullif(left(trim(coalesce(p_name, '')), 120), ''), author_name),
    author_contact = coalesce(nullif(left(trim(coalesce(p_contact, '')), 120), ''), author_contact),
    sent_to_google = v_to,
    platform       = case when v_to then coalesce(p_platform, v_r.platform) end
  where id = p_review_id;

  return json_build_object(
    'ok', true,
    'review_id', p_review_id,
    'to_public', v_to,
    'platforms', case when v_to then public.business_platforms(v_b) end
  );
end;
$$;

-- The one write an owner gets: ticking feedback off. Scoped to their own
-- business's rows (or the admin's reach), nothing else about a review moves.
create or replace function public.set_feedback_handled(p_review_id uuid, p_handled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reviews r
  set handled_at = case when p_handled then now() end
  from public.businesses b
  where r.id = p_review_id
    and b.id = r.business_id
    and (b.owner_email = public.jwt_email() or public.is_admin());
  if not found then
    raise exception 'not-available';
  end if;
end;
$$;

revoke all on function public.review_page(text) from public;
revoke all on function public.submit_review(text, int, text, text, text, text) from public;
revoke all on function public.add_feedback(uuid, int, text, text, text, text) from public;
revoke all on function public.set_feedback_handled(uuid, boolean) from public;
revoke all on function public.business_platforms(public.businesses) from public;
revoke all on function public.assert_platform(public.businesses, text) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.jwt_email() from public;
grant execute on function public.review_page(text) to anon, authenticated;
grant execute on function public.submit_review(text, int, text, text, text, text) to anon, authenticated;
grant execute on function public.add_feedback(uuid, int, text, text, text, text) to anon, authenticated;
grant execute on function public.set_feedback_handled(uuid, boolean) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.jwt_email() to authenticated;

-- ── seed your admin ───────────────────────────────────────────────────────
-- The email you sign in with at qrebi.ge/login to reach /admin:

insert into public.admins (email) values ('bozukabozi@gmail.com')
on conflict do nothing;
