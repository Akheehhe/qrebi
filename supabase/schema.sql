-- ═══════════════════════════════════════════════════════════════════════
-- Podium — database schema, row-level security, and game rules.
--
-- Apply once to a Supabase project (SQL editor or a migration). Every
-- statement is idempotent, so re-running it is safe.
--
-- Trust model
--   • Users read and write their own rows through RLS.
--   • Anything that moves the competition — points, challenge results,
--     prize claims — goes through the SECURITY DEFINER functions at the end,
--     so a client holding only the publishable key can never write points
--     for itself. Points are computed here from duration and category; the
--     client never supplies them.
-- ═══════════════════════════════════════════════════════════════════════

-- ── profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name     text not null check (char_length(display_name) between 1 and 40),
  avatar_url       text,
  city             text check (city is null or char_length(city) <= 60),
  daily_kcal_goal  int  not null default 2300 check (daily_kcal_goal between 800 and 8000),
  protein_goal_g   int  not null default 150  check (protein_goal_g between 0 and 600),
  carbs_goal_g     int  not null default 250  check (carbs_goal_g between 0 and 1200),
  fat_goal_g       int  not null default 70   check (fat_goal_g between 0 and 400),
  weight_kg        numeric(5,1) check (weight_kg is null or weight_kg between 30 and 300),
  created_at       timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: signed-in users can read" on public.profiles;
create policy "profiles: signed-in users can read"
  on public.profiles for select to authenticated using (true);

drop policy if exists "profiles: owner can update" on public.profiles;
create policy "profiles: owner can update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Inserts happen only from the auth trigger below.

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_username text;
  v_display  text;
begin
  v_username := lower(coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email, ''), '@', 1)));
  v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
  if char_length(v_username) < 3 then
    v_username := 'user' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  v_username := substr(v_username, 1, 20);
  while exists (select 1 from public.profiles p where p.username = v_username) loop
    v_username := substr(v_username, 1, 14) || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);
  end loop;

  v_display := coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), v_username);

  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, v_username, substr(v_display, 1, 40), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── food_logs ────────────────────────────────────────────────────────────
create table if not exists public.food_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  logged_on   date not null default current_date,
  meal        text not null check (meal in ('breakfast','lunch','dinner','snack')),
  name        text not null check (char_length(name) between 1 and 120),
  kcal        int  not null check (kcal between 0 and 5000),
  protein_g   numeric(6,1) not null default 0 check (protein_g >= 0),
  carbs_g     numeric(6,1) not null default 0 check (carbs_g >= 0),
  fat_g       numeric(6,1) not null default 0 check (fat_g >= 0),
  source      text not null default 'manual' check (source in ('manual','scan','barcode')),
  created_at  timestamptz not null default now()
);
create index if not exists food_logs_user_day on public.food_logs (user_id, logged_on);
alter table public.food_logs enable row level security;

drop policy if exists "food_logs: owner" on public.food_logs;
create policy "food_logs: owner"
  on public.food_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── workouts + sets ──────────────────────────────────────────────────────
create table if not exists public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 80),
  category     text not null check (category in ('strength','hiit','run','mobility','other')),
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  duration_sec int check (duration_sec is null or duration_sec between 0 and 21600),
  kcal_burned  int not null default 0 check (kcal_burned between 0 and 5000),
  status       text not null default 'active' check (status in ('active','completed','discarded')),
  notes        text check (notes is null or char_length(notes) <= 500),
  created_at   timestamptz not null default now()
);
create index if not exists workouts_user_started on public.workouts (user_id, started_at desc);
alter table public.workouts enable row level security;

drop policy if exists "workouts: owner" on public.workouts;
create policy "workouts: owner"
  on public.workouts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.workout_sets (
  id           uuid primary key default gen_random_uuid(),
  workout_id   uuid not null references public.workouts(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  exercise     text not null check (char_length(exercise) between 1 and 80),
  set_index    int  not null check (set_index between 1 and 50),
  weight_kg    numeric(6,1) check (weight_kg is null or weight_kg between 0 and 600),
  reps         int check (reps is null or reps between 0 and 500),
  duration_sec int check (duration_sec is null or duration_sec between 0 and 7200),
  completed    boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists workout_sets_workout on public.workout_sets (workout_id, set_index);
alter table public.workout_sets enable row level security;

drop policy if exists "workout_sets: owner" on public.workout_sets;
create policy "workout_sets: owner"
  on public.workout_sets for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── weight_logs ──────────────────────────────────────────────────────────
create table if not exists public.weight_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  logged_on  date not null default current_date,
  weight_kg  numeric(5,1) not null check (weight_kg between 30 and 300),
  created_at timestamptz not null default now(),
  unique (user_id, logged_on)
);
alter table public.weight_logs enable row level security;

drop policy if exists "weight_logs: owner" on public.weight_logs;
create policy "weight_logs: owner"
  on public.weight_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── friendships ──────────────────────────────────────────────────────────
create table if not exists public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  addressee_id  uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at    timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
-- one row per pair, whichever direction it was sent in
create unique index if not exists friendships_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
alter table public.friendships enable row level security;

drop policy if exists "friendships: participants read" on public.friendships;
create policy "friendships: participants read"
  on public.friendships for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "friendships: participants update" on public.friendships;
create policy "friendships: participants update"
  on public.friendships for update to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid())
  with check (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "friendships: participants delete" on public.friendships;
create policy "friendships: participants delete"
  on public.friendships for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
-- Inserts go through request_friend() so a reverse pending request is accepted instead of duplicated.

-- ── challenges ───────────────────────────────────────────────────────────
create table if not exists public.challenges (
  id                uuid primary key default gen_random_uuid(),
  challenger_id     uuid not null references public.profiles(id) on delete cascade,
  opponent_id       uuid not null references public.profiles(id) on delete cascade,
  metric            text not null check (metric in ('kcal_burned','workouts','points')),
  duration_days     int  not null check (duration_days in (7, 14, 30)),
  starts_at         timestamptz not null default now(),
  ends_at           timestamptz not null,
  stake             text check (stake is null or char_length(stake) <= 120),
  status            text not null default 'pending' check (status in ('pending','active','finished','declined')),
  winner_id         uuid references public.profiles(id),
  challenger_score  int not null default 0,
  opponent_score    int not null default 0,
  created_at        timestamptz not null default now(),
  check (challenger_id <> opponent_id),
  check (ends_at > starts_at)
);
create index if not exists challenges_challenger on public.challenges (challenger_id, status);
create index if not exists challenges_opponent   on public.challenges (opponent_id, status);
alter table public.challenges enable row level security;

drop policy if exists "challenges: participants read" on public.challenges;
create policy "challenges: participants read"
  on public.challenges for select to authenticated
  using (challenger_id = auth.uid() or opponent_id = auth.uid());
-- Writes go through create_challenge() / respond_challenge() / get_challenge().

create table if not exists public.challenge_messages (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  body          text not null check (char_length(body) between 1 and 280),
  created_at    timestamptz not null default now()
);
create index if not exists challenge_messages_challenge on public.challenge_messages (challenge_id, created_at);
alter table public.challenge_messages enable row level security;

drop policy if exists "challenge_messages: participants read" on public.challenge_messages;
create policy "challenge_messages: participants read"
  on public.challenge_messages for select to authenticated
  using (exists (select 1 from public.challenges c
                 where c.id = challenge_id and (c.challenger_id = auth.uid() or c.opponent_id = auth.uid())));

drop policy if exists "challenge_messages: participants write" on public.challenge_messages;
create policy "challenge_messages: participants write"
  on public.challenge_messages for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.challenges c
                 where c.id = challenge_id and c.status in ('pending','active','finished')
                   and (c.challenger_id = auth.uid() or c.opponent_id = auth.uid())));

-- ── points_ledger ────────────────────────────────────────────────────────
-- Every point ever earned or spent. Leaderboards sum the positive rows in a
-- period; the balance is the sum of everything.
create table if not exists public.points_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  points      int  not null check (points between -100000 and 100000),
  reason      text not null check (reason in ('workout','food_log','challenge_win','streak','prize_claim','bonus')),
  ref_id      uuid,
  awarded_on  date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists points_ledger_user_time on public.points_ledger (user_id, created_at desc);
create index if not exists points_ledger_time on public.points_ledger (created_at desc);
create unique index if not exists points_food_once_a_day
  on public.points_ledger (user_id, awarded_on) where reason = 'food_log';
alter table public.points_ledger enable row level security;

drop policy if exists "points_ledger: owner reads" on public.points_ledger;
create policy "points_ledger: owner reads"
  on public.points_ledger for select to authenticated using (user_id = auth.uid());
-- No insert/update/delete policies: only the functions below write here.

-- Logging your first meal of the day is worth 5 points.
create or replace function public.award_food_log_points()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.points_ledger (user_id, points, reason, ref_id, awarded_on)
  values (new.user_id, 5, 'food_log', new.id, new.logged_on)
  on conflict (user_id, awarded_on) where reason = 'food_log' do nothing;
  return new;
end
$$;

drop trigger if exists food_log_points on public.food_logs;
create trigger food_log_points
  after insert on public.food_logs
  for each row execute function public.award_food_log_points();

-- ── prizes + claims ──────────────────────────────────────────────────────
create table if not exists public.prizes (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  emoji        text,
  image_url    text,
  cost_points  int check (cost_points is null or cost_points > 0),
  rank_gate    int check (rank_gate is null or rank_gate between 1 and 100),
  period       text check (period is null or period in ('weekly','monthly')),
  stock        int  not null default 100 check (stock >= 0),
  active       boolean not null default true,
  sort         int  not null default 0,
  check (cost_points is not null or rank_gate is not null)
);
alter table public.prizes enable row level security;

drop policy if exists "prizes: signed-in users read" on public.prizes;
create policy "prizes: signed-in users read"
  on public.prizes for select to authenticated using (active);

create table if not exists public.prize_claims (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  prize_id      uuid not null references public.prizes(id),
  points_spent  int  not null default 0,
  period_key    text,
  status        text not null default 'pending' check (status in ('pending','fulfilled','cancelled')),
  created_at    timestamptz not null default now()
);
create index if not exists prize_claims_user on public.prize_claims (user_id, created_at desc);
alter table public.prize_claims enable row level security;

drop policy if exists "prize_claims: owner reads" on public.prize_claims;
create policy "prize_claims: owner reads"
  on public.prize_claims for select to authenticated using (user_id = auth.uid());
-- Inserts go through claim_prize().

insert into public.prizes (slug, title, description, emoji, cost_points, rank_gate, period, sort) values
  ('protein-shake',   'Protein shake',        'Chocolate or vanilla whey shake. Show the claim at the front desk.', '🥤', 800,  null, null, 1),
  ('protein-bars',    'Protein bars ×12',     'A box of twelve. Pick your flavour when you collect.',                '🍫', 1500, null, null, 2),
  ('podium-shaker',   'Podium shaker',        'Matte black 700 ml shaker with the gold podium mark.',                '🧴', 1200, null, null, 3),
  ('pt-session',      'PT session',           'One 60-minute personal training session.',                           '🏋️', 2500, null, null, 4),
  ('free-gym-month',  'Free gym month',       'Finish last week in the top 3 and the next month of gym is on us.',   '🎟️', null, 3, 'weekly', 5),
  ('champion-hoodie', 'Champion hoodie',      'Win the month outright. One per champion.',                          '🏆', null, 1, 'monthly', 6)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, emoji = excluded.emoji,
  cost_points = excluded.cost_points, rank_gate = excluded.rank_gate, period = excluded.period, sort = excluded.sort;

-- ═══════════════════════════════════════════════════════════════════════
-- Game rules — SECURITY DEFINER functions. Everything below runs as the
-- table owner, checks auth.uid() itself, and is the only path that writes
-- points, challenge state, or claims.
-- ═══════════════════════════════════════════════════════════════════════

-- Estimated calories for a session: MET × body weight (kg) × hours.
create or replace function public.estimate_kcal(p_category text, p_weight_kg numeric, p_duration_sec int)
returns int
language sql immutable
as $$
  select round(
    case p_category
      when 'strength' then 6.0
      when 'hiit'     then 8.0
      when 'run'      then 9.8
      when 'mobility' then 3.0
      else 5.0
    end * coalesce(p_weight_kg, 75) * (least(greatest(p_duration_sec, 0), 10800) / 3600.0)
  )::int
$$;

-- Finish an active workout. Duration comes from the clock, calories from the
-- estimate above, points from the rules: 50 for a real session (5 minutes or
-- more) plus 1 per 10 kcal, capped at 300, and at most 3 rewarded sessions a day.
create or replace function public.complete_workout(p_workout_id uuid, p_notes text default null)
returns table (kcal_burned int, points int, duration_sec int)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  w              public.workouts%rowtype;
  v_weight       numeric;
  v_dur          int;
  v_kcal         int;
  v_points       int := 0;
  v_today_count  int;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;

  select * into w from public.workouts wk where wk.id = p_workout_id and wk.user_id = auth.uid() for update;
  if not found then raise exception 'workout-not-found'; end if;
  if w.status <> 'active' then raise exception 'workout-not-active'; end if;

  v_dur := least(21600, greatest(0, extract(epoch from (now() - w.started_at))::int));
  select coalesce(p.weight_kg, 75) into v_weight from public.profiles p where p.id = auth.uid();
  v_kcal := public.estimate_kcal(w.category, v_weight, v_dur);

  select count(*) into v_today_count
    from public.points_ledger l
   where l.user_id = auth.uid() and l.reason = 'workout' and l.created_at >= date_trunc('day', now());

  if v_dur >= 300 and v_today_count < 3 then
    v_points := least(300, 50 + v_kcal / 10);
  end if;

  update public.workouts wk
     set status = 'completed', ended_at = now(), duration_sec = v_dur, kcal_burned = v_kcal,
         notes = coalesce(nullif(trim(p_notes), ''), wk.notes)
   where wk.id = w.id;

  if v_points > 0 then
    insert into public.points_ledger (user_id, points, reason, ref_id)
    values (auth.uid(), v_points, 'workout', w.id);
  end if;

  return query select v_kcal, v_points, v_dur;
end
$$;
revoke all on function public.complete_workout(uuid, text) from public;
grant execute on function public.complete_workout(uuid, text) to authenticated;

-- Log a session you already did (no live timer). Same rules as complete_workout.
create or replace function public.log_workout(p_title text, p_category text, p_duration_min int, p_started_at timestamptz default null)
returns table (workout_id uuid, kcal_burned int, points int)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_id           uuid;
  v_weight       numeric;
  v_dur          int;
  v_kcal         int;
  v_points       int := 0;
  v_today_count  int;
  v_start        timestamptz;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;
  if p_category not in ('strength','hiit','run','mobility','other') then raise exception 'bad-category'; end if;
  if p_duration_min is null or p_duration_min < 1 or p_duration_min > 360 then raise exception 'bad-duration'; end if;

  v_dur   := p_duration_min * 60;
  v_start := coalesce(p_started_at, now() - make_interval(secs => v_dur));
  if v_start > now() then raise exception 'future-workout'; end if;

  select coalesce(p.weight_kg, 75) into v_weight from public.profiles p where p.id = auth.uid();
  v_kcal := public.estimate_kcal(p_category, v_weight, v_dur);

  select count(*) into v_today_count
    from public.points_ledger l
   where l.user_id = auth.uid() and l.reason = 'workout' and l.created_at >= date_trunc('day', now());
  if v_dur >= 300 and v_today_count < 3 then
    v_points := least(300, 50 + v_kcal / 10);
  end if;

  insert into public.workouts (user_id, title, category, started_at, ended_at, duration_sec, kcal_burned, status)
  values (auth.uid(), substr(trim(p_title), 1, 80), p_category, v_start, v_start + make_interval(secs => v_dur), v_dur, v_kcal, 'completed')
  returning id into v_id;

  if v_points > 0 then
    insert into public.points_ledger (user_id, points, reason, ref_id)
    values (auth.uid(), v_points, 'workout', v_id);
  end if;

  return query select v_id, v_kcal, v_points;
end
$$;
revoke all on function public.log_workout(text, text, int, timestamptz) from public;
grant execute on function public.log_workout(text, text, int, timestamptz) to authenticated;

-- Consecutive active days (a completed workout or a food log) ending today or yesterday.
create or replace function public.current_streak(p_user uuid default auth.uid())
returns int
language sql security definer stable set search_path = public
as $$
  with days as (
    select distinct d from (
      select (w.ended_at at time zone 'utc')::date as d
        from public.workouts w where w.user_id = p_user and w.status = 'completed' and w.ended_at is not null
      union
      select f.logged_on from public.food_logs f where f.user_id = p_user
    ) x
    where d <= current_date
  ),
  anchor as (
    select case when exists (select 1 from days where d = current_date) then current_date else current_date - 1 end as a
  ),
  numbered as (
    select d, row_number() over (order by d desc) as rn from days, anchor where d <= anchor.a
  )
  select coalesce(count(*)::int, 0)
    from numbered, anchor
   where d = anchor.a - (rn - 1)::int
$$;
revoke all on function public.current_streak(uuid) from public;
grant execute on function public.current_streak(uuid) to authenticated;

-- Weekly / monthly leaderboard: positive points earned since the start of the period.
create or replace function public.leaderboard(p_period text default 'weekly', p_limit int default 50)
returns table (rank bigint, user_id uuid, username text, display_name text, avatar_url text, points bigint, is_me boolean)
language sql security definer stable set search_path = public
as $$
  with since as (
    select case when p_period = 'monthly' then date_trunc('month', now()) else date_trunc('week', now()) end as t
  ),
  totals as (
    select l.user_id, sum(l.points)::bigint as points
      from public.points_ledger l, since
     where l.points > 0 and l.created_at >= since.t
     group by l.user_id
  )
  select rank() over (order by t.points desc, p.username asc) as rank,
         p.id, p.username, p.display_name, p.avatar_url, t.points, (p.id = auth.uid()) as is_me
    from totals t
    join public.profiles p on p.id = t.user_id
   order by t.points desc, p.username asc
   limit greatest(1, least(coalesce(p_limit, 50), 200))
$$;
revoke all on function public.leaderboard(text, int) from public;
grant execute on function public.leaderboard(text, int) to authenticated;

create or replace function public.my_rank(p_period text default 'weekly')
returns table (rank bigint, points bigint, players bigint, gap_to_top5 bigint)
language sql security definer stable set search_path = public
as $$
  with since as (
    select case when p_period = 'monthly' then date_trunc('month', now()) else date_trunc('week', now()) end as t
  ),
  totals as (
    select l.user_id, sum(l.points)::bigint as points
      from public.points_ledger l, since
     where l.points > 0 and l.created_at >= since.t
     group by l.user_id
  ),
  ranked as (
    select t.user_id, t.points, rank() over (order by t.points desc, p.username asc) as rank
      from totals t join public.profiles p on p.id = t.user_id
  ),
  fifth as (
    select points from ranked where rank <= 5 order by rank desc limit 1
  )
  select r.rank, r.points, (select count(*) from totals),
         greatest(0, coalesce((select points from fifth), 0) - r.points)
    from ranked r
   where r.user_id = auth.uid()
$$;
revoke all on function public.my_rank(text) from public;
grant execute on function public.my_rank(text) to authenticated;

-- All-time balance (earned minus spent) for the signed-in user.
create or replace function public.my_points()
returns bigint
language sql security definer stable set search_path = public
as $$
  select coalesce(sum(l.points), 0)::bigint from public.points_ledger l where l.user_id = auth.uid()
$$;
revoke all on function public.my_points() from public;
grant execute on function public.my_points() to authenticated;

-- Friend request. If the other person already asked, this accepts instead of duplicating.
create or replace function public.request_friend(p_user uuid)
returns text
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_existing public.friendships%rowtype;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;
  if p_user = auth.uid() then raise exception 'cannot-friend-self'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_user) then raise exception 'user-not-found'; end if;

  select * into v_existing from public.friendships f
   where (f.requester_id = auth.uid() and f.addressee_id = p_user)
      or (f.requester_id = p_user and f.addressee_id = auth.uid())
   for update;

  if found then
    if v_existing.status = 'accepted' then return 'accepted'; end if;
    if v_existing.requester_id = p_user then
      update public.friendships f set status = 'accepted' where f.id = v_existing.id;
      return 'accepted';
    end if;
    if v_existing.status = 'declined' then
      update public.friendships f set status = 'pending', requester_id = auth.uid(), addressee_id = p_user where f.id = v_existing.id;
    end if;
    return 'pending';
  end if;

  insert into public.friendships (requester_id, addressee_id) values (auth.uid(), p_user);
  return 'pending';
end
$$;
revoke all on function public.request_friend(uuid) from public;
grant execute on function public.request_friend(uuid) to authenticated;

-- Score for one player over a window, by challenge metric.
create or replace function public.challenge_score(p_user uuid, p_metric text, p_from timestamptz, p_to timestamptz)
returns int
language sql security definer stable set search_path = public
as $$
  select coalesce(
    case p_metric
      when 'kcal_burned' then (select sum(w.kcal_burned) from public.workouts w
                                where w.user_id = p_user and w.status = 'completed' and w.ended_at >= p_from and w.ended_at < p_to)
      when 'workouts'    then (select count(*) from public.workouts w
                                where w.user_id = p_user and w.status = 'completed' and w.ended_at >= p_from and w.ended_at < p_to)
      else                    (select sum(l.points) from public.points_ledger l
                                where l.user_id = p_user and l.points > 0 and l.created_at >= p_from and l.created_at < p_to)
    end, 0)::int
$$;
revoke all on function public.challenge_score(uuid, text, timestamptz, timestamptz) from public;

create or replace function public.create_challenge(p_opponent uuid, p_metric text, p_duration_days int, p_stake text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;
  if p_opponent = auth.uid() then raise exception 'cannot-challenge-self'; end if;
  if p_metric not in ('kcal_burned','workouts','points') then raise exception 'bad-metric'; end if;
  if p_duration_days not in (7, 14, 30) then raise exception 'bad-duration'; end if;
  if not exists (
      select 1 from public.friendships f
       where f.status = 'accepted'
         and ((f.requester_id = auth.uid() and f.addressee_id = p_opponent)
           or (f.addressee_id = auth.uid() and f.requester_id = p_opponent))) then
    raise exception 'not-friends';
  end if;
  if exists (
      select 1 from public.challenges c
       where c.status in ('pending','active')
         and ((c.challenger_id = auth.uid() and c.opponent_id = p_opponent)
           or (c.opponent_id = auth.uid() and c.challenger_id = p_opponent))) then
    raise exception 'challenge-exists';
  end if;

  insert into public.challenges (challenger_id, opponent_id, metric, duration_days, starts_at, ends_at, stake)
  values (auth.uid(), p_opponent, p_metric, p_duration_days, now(), now() + make_interval(days => p_duration_days),
          nullif(substr(trim(coalesce(p_stake, '')), 1, 120), ''))
  returning id into v_id;
  return v_id;
end
$$;
revoke all on function public.create_challenge(uuid, text, int, text) from public;
grant execute on function public.create_challenge(uuid, text, int, text) to authenticated;

create or replace function public.respond_challenge(p_id uuid, p_accept boolean)
returns text
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  c public.challenges%rowtype;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;
  select * into c from public.challenges ch where ch.id = p_id and ch.opponent_id = auth.uid() for update;
  if not found then raise exception 'challenge-not-found'; end if;
  if c.status <> 'pending' then raise exception 'challenge-not-pending'; end if;

  if p_accept then
    update public.challenges ch
       set status = 'active', starts_at = now(), ends_at = now() + make_interval(days => c.duration_days)
     where ch.id = c.id;
    return 'active';
  else
    update public.challenges ch set status = 'declined' where ch.id = c.id;
    return 'declined';
  end if;
end
$$;
revoke all on function public.respond_challenge(uuid, boolean) from public;
grant execute on function public.respond_challenge(uuid, boolean) to authenticated;

-- Read a challenge with live scores. Settles it (winner + 200 points) once time is up.
create or replace function public.get_challenge(p_id uuid)
returns table (id uuid, challenger_id uuid, opponent_id uuid, metric text, duration_days int,
               starts_at timestamptz, ends_at timestamptz, stake text, status text, winner_id uuid,
               challenger_score int, opponent_score int, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  c     public.challenges%rowtype;
  v_now timestamptz := now();
begin
  select * into c from public.challenges ch
   where ch.id = p_id and (ch.challenger_id = auth.uid() or ch.opponent_id = auth.uid())
   for update;
  if not found then return; end if;

  if c.status = 'active' then
    c.challenger_score := public.challenge_score(c.challenger_id, c.metric, c.starts_at, least(c.ends_at, v_now));
    c.opponent_score   := public.challenge_score(c.opponent_id,   c.metric, c.starts_at, least(c.ends_at, v_now));

    if v_now >= c.ends_at then
      c.status    := 'finished';
      c.winner_id := case when c.challenger_score > c.opponent_score then c.challenger_id
                          when c.opponent_score > c.challenger_score then c.opponent_id
                          else null end;
      update public.challenges ch
         set status = 'finished', winner_id = c.winner_id,
             challenger_score = c.challenger_score, opponent_score = c.opponent_score
       where ch.id = c.id;
      if c.winner_id is not null then
        insert into public.points_ledger (user_id, points, reason, ref_id)
        values (c.winner_id, 200, 'challenge_win', c.id);
      end if;
    else
      update public.challenges ch
         set challenger_score = c.challenger_score, opponent_score = c.opponent_score
       where ch.id = c.id;
    end if;
  end if;

  return query
    select c.id, c.challenger_id, c.opponent_id, c.metric, c.duration_days, c.starts_at, c.ends_at,
           c.stake, c.status, c.winner_id, c.challenger_score, c.opponent_score, c.created_at;
end
$$;
revoke all on function public.get_challenge(uuid) from public;
grant execute on function public.get_challenge(uuid) to authenticated;

-- Day-by-day scores for the head-to-head chart.
create or replace function public.challenge_daily(p_id uuid)
returns table (day date, challenger int, opponent int)
language plpgsql security definer stable set search_path = public
as $$
#variable_conflict use_column
declare
  c public.challenges%rowtype;
begin
  select * into c from public.challenges ch
   where ch.id = p_id and (ch.challenger_id = auth.uid() or ch.opponent_id = auth.uid());
  if not found then return; end if;

  return query
    select d::date,
           public.challenge_score(c.challenger_id, c.metric, d, d + interval '1 day'),
           public.challenge_score(c.opponent_id,   c.metric, d, d + interval '1 day')
      from generate_series(date_trunc('day', c.starts_at), date_trunc('day', least(c.ends_at, now())), interval '1 day') as d;
end
$$;
revoke all on function public.challenge_daily(uuid) from public;
grant execute on function public.challenge_daily(uuid) to authenticated;

-- Claim a prize. Point prizes debit the balance; rank prizes need a top-N
-- finish in the previous completed period and can be claimed once per period.
create or replace function public.claim_prize(p_prize uuid)
returns table (claim_id uuid, points_spent int, balance bigint)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  pz        public.prizes%rowtype;
  v_balance bigint;
  v_rank    bigint;
  v_from    timestamptz;
  v_to      timestamptz;
  v_key     text;
  v_claim   uuid;
begin
  if auth.uid() is null then raise exception 'not-signed-in'; end if;

  select * into pz from public.prizes p where p.id = p_prize and p.active for update;
  if not found then raise exception 'prize-not-found'; end if;
  if pz.stock <= 0 then raise exception 'out-of-stock'; end if;

  select coalesce(sum(l.points), 0) into v_balance from public.points_ledger l where l.user_id = auth.uid();

  if pz.rank_gate is not null then
    if pz.period = 'monthly' then
      v_to := date_trunc('month', now()); v_from := v_to - interval '1 month'; v_key := to_char(v_from, 'YYYY-MM');
    else
      v_to := date_trunc('week', now());  v_from := v_to - interval '7 days';  v_key := to_char(v_from, 'IYYY-"W"IW');
    end if;

    if exists (select 1 from public.prize_claims pc
                where pc.user_id = auth.uid() and pc.prize_id = pz.id and pc.period_key = v_key) then
      raise exception 'already-claimed';
    end if;

    select r.rank into v_rank from (
      select l.user_id, rank() over (order by sum(l.points) desc) as rank
        from public.points_ledger l
       where l.points > 0 and l.created_at >= v_from and l.created_at < v_to
       group by l.user_id
    ) r where r.user_id = auth.uid();

    if v_rank is null or v_rank > pz.rank_gate then raise exception 'rank-too-low'; end if;

    insert into public.prize_claims (user_id, prize_id, points_spent, period_key)
    values (auth.uid(), pz.id, 0, v_key) returning id into v_claim;
  else
    if v_balance < pz.cost_points then raise exception 'insufficient-points'; end if;
    insert into public.points_ledger (user_id, points, reason, ref_id)
    values (auth.uid(), -pz.cost_points, 'prize_claim', pz.id);
    insert into public.prize_claims (user_id, prize_id, points_spent)
    values (auth.uid(), pz.id, pz.cost_points) returning id into v_claim;
    v_balance := v_balance - pz.cost_points;
  end if;

  update public.prizes p set stock = p.stock - 1 where p.id = pz.id;

  return query select v_claim, coalesce(pz.cost_points, 0), v_balance;
end
$$;
revoke all on function public.claim_prize(uuid) from public;
grant execute on function public.claim_prize(uuid) to authenticated;

-- Rank in the previous completed period (what rank-gated prizes look at).
create or replace function public.my_last_period_rank(p_period text default 'weekly')
returns table (rank bigint, points bigint, period_key text)
language sql security definer stable set search_path = public
as $$
  with win as (
    select case when p_period = 'monthly' then date_trunc('month', now()) else date_trunc('week', now()) end as t_to
  ),
  bounds as (
    select case when p_period = 'monthly' then t_to - interval '1 month' else t_to - interval '7 days' end as t_from, t_to from win
  ),
  totals as (
    select l.user_id, sum(l.points)::bigint as points
      from public.points_ledger l, bounds b
     where l.points > 0 and l.created_at >= b.t_from and l.created_at < b.t_to
     group by l.user_id
  ),
  ranked as (
    select user_id, points, rank() over (order by points desc) as rank from totals
  )
  select r.rank, r.points,
         case when p_period = 'monthly' then to_char(b.t_from, 'YYYY-MM') else to_char(b.t_from, 'IYYY-"W"IW') end
    from ranked r, bounds b
   where r.user_id = auth.uid()
$$;
revoke all on function public.my_last_period_rank(text) from public;
grant execute on function public.my_last_period_rank(text) to authenticated;

-- Username check for the sign-up form (callable before sign-in).
create or replace function public.username_available(p_username text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select p_username ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles p where p.username = lower(p_username))
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
