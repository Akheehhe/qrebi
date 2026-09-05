-- ═══════════════════════════════════════════════════════════════════════
-- Podium — optional demo data.
--
-- Creates four demo athletes with a fortnight of workouts so the leaderboard
-- and challenges have opponents on day one. Run AFTER schema.sql, as the
-- postgres role (SQL editor or a migration). Safe to re-run.
--
-- The demo accounts share the password "podium-demo". They hold no real data
-- and exist only so you can sign in as an opponent while testing. Delete them
-- before launch:  delete from auth.users where email like '%@demo.podium.app';
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare
  demo      record;
  v_id      uuid;
  v_day     int;
  v_start   timestamptz;
  v_dur     int;
  v_kcal    int;
  v_weight  numeric := 78;
  v_cat     text;
  v_title   text;
  cats      text[] := array['strength','hiit','run','mobility'];
  titles    text[] := array['Upper Body Push','20-min HIIT Burner','5K Tempo Run','Core & Mobility'];
begin
  for demo in
    select * from (values
      ('nika', 'Nika',  'nika@demo.podium.app', 'Tbilisi',  4),
      ('mari', 'Mari',  'mari@demo.podium.app', 'Batumi',   3),
      ('gio',  'Gio',   'gio@demo.podium.app',  'Tbilisi',  2),
      ('luka', 'Luka',  'luka@demo.podium.app', 'Kutaisi',  1)
    ) as t(username, display_name, email, city, intensity)
  loop
    select u.id into v_id from auth.users u where u.email = demo.email;

    if v_id is null then
      v_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', demo.email,
        extensions.crypt('podium-demo', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', demo.username, 'display_name', demo.display_name),
        now() - interval '30 days', now(), '', '', '', '', false
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), v_id, demo.email,
              jsonb_build_object('sub', v_id::text, 'email', demo.email, 'email_verified', true),
              'email', now(), now(), now());
    end if;

    update public.profiles set city = demo.city, weight_kg = v_weight where id = v_id;

    -- Only seed activity once.
    if not exists (select 1 from public.workouts w where w.user_id = v_id) then
      for v_day in reverse 13..0 loop
        -- intensity 4 trains almost daily, intensity 1 about twice a week
        if (v_day * 7 + demo.intensity * 3) % (6 - demo.intensity) = 0 or demo.intensity = 4 and v_day % 5 <> 0 then
          v_cat   := cats[1 + (v_day + demo.intensity) % 4];
          v_title := titles[1 + (v_day + demo.intensity) % 4];
          v_dur   := (25 + ((v_day * 11 + demo.intensity * 7) % 35)) * 60;
          v_start := date_trunc('day', now()) - make_interval(days => v_day) + interval '18 hours';
          v_kcal  := public.estimate_kcal(v_cat, v_weight, v_dur);

          insert into public.workouts (user_id, title, category, started_at, ended_at, duration_sec, kcal_burned, status, created_at)
          values (v_id, v_title, v_cat, v_start, v_start + make_interval(secs => v_dur), v_dur, v_kcal, 'completed', v_start);

          insert into public.points_ledger (user_id, points, reason, awarded_on, created_at)
          values (v_id, least(300, 50 + v_kcal / 10), 'workout', v_start::date, v_start + make_interval(secs => v_dur));
        end if;

        -- a food log most days, worth 5 points once a day
        if (v_day + demo.intensity) % 3 <> 0 then
          insert into public.food_logs (user_id, logged_on, meal, name, kcal, protein_g, carbs_g, fat_g, source, created_at)
          values (v_id, (now() - make_interval(days => v_day))::date, 'lunch', 'Chicken, rice and salad', 640, 48, 62, 14, 'manual',
                  date_trunc('day', now()) - make_interval(days => v_day) + interval '13 hours');
        end if;
      end loop;
    end if;
  end loop;
end
$$;

-- Everybody is friends with everybody among the demo accounts, so challenges can be tested between them.
insert into public.friendships (requester_id, addressee_id, status)
select a.id, b.id, 'accepted'
  from public.profiles a
  join public.profiles b on a.id < b.id
  join auth.users ua on ua.id = a.id and ua.email like '%@demo.podium.app'
  join auth.users ub on ub.id = b.id and ub.email like '%@demo.podium.app'
on conflict do nothing;
