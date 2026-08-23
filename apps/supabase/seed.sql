-- ============================================================================
-- XapXap seed data (matches current schema as of migration 0010)
-- Deterministic UUIDs so relations are stable. Runs as the postgres role, so
-- RLS is bypassed. The fame_heuristics rows are auto-created by the trigger
-- defined in 0006, then updated below for demo statuses.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Storage: media bucket + RLS policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'media' );

drop policy if exists "Authenticated Users can upload media" on storage.objects;
create policy "Authenticated Users can upload media"
on storage.objects for insert
with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

drop policy if exists "Users can update their own media" on storage.objects;
create policy "Users can update their own media"
on storage.objects for update
using ( bucket_id = 'media' and auth.uid() = owner )
with check ( bucket_id = 'media' and auth.uid() = owner );

drop policy if exists "Users can delete their own media" on storage.objects;
create policy "Users can delete their own media"
on storage.objects for delete
using ( bucket_id = 'media' and auth.uid() = owner );

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
insert into public.profiles (id, username, displayName, avatarUrl, bio, isPremium, role, createdAt, updatedAt) values
  ('10000000-0000-4000-8000-000000000001', 'cyber_punk',    'CyberPunk',    'https://i.pravatar.cc/150?img=12', 'Building the future at one frame per minute.', true,  'user', now() - interval '120 days', now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000002', 'neon_rider',    'Neon Rider',   'https://i.pravatar.cc/150?img=15', 'Screens. Streets. Speed.',                      false, 'user', now() - interval '95 days',  now() - interval '5 days'),
  ('10000000-0000-4000-8000-000000000003', 'rumzkurama',    'Rumz',         'https://i.pravatar.cc/150?img=33', 'Just here for the waves.',                       false, 'user', now() - interval '60 days',  now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000004', 'kwame_the_goat','Kwame',        'https://i.pravatar.cc/150?img=57', 'Big dreams, bigger waves.',                      true,  'user', now() - interval '45 days',  now() - interval '10 days'),
  ('10000000-0000-4000-8000-000000000005', 'nyash_chef',    'Nyash Chef',   'https://i.pravatar.cc/150?img=45', 'Cookin'' up content daily.',                     false, 'user', now() - interval '30 days',  now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000006', 'drift_king',    'Drift King',   'https://i.pravatar.cc/150?img=59', 'Oversteering through life.',                     false, 'user', now() - interval '20 days',  now() - interval '4 days'),
  ('10000000-0000-4000-8000-000000000007', 'sahara_siren',  'Sahara',       'https://i.pravatar.cc/150?img=47', 'Sand in my code, stardust in my feed.',          true,  'user', now() - interval '10 days',  now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000008', 'pixel_punisher','Pixel',        'https://i.pravatar.cc/150?img=11', 'Gaming at 240fps, uploading at 1fame/min.',      false, 'user', now() - interval '5 days',   now() - interval '6 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tags (match AVAILABLE_TAGS in the app)
-- ---------------------------------------------------------------------------
insert into public.tags (id, tag, count) values
  ('70000000-0000-4000-8000-000000000001', 'music',  0),
  ('70000000-0000-4000-8000-000000000002', 'humor',  0),
  ('70000000-0000-4000-8000-000000000003', 'gaming', 0),
  ('70000000-0000-4000-8000-000000000004', 'live',   0),
  ('70000000-0000-4000-8000-000000000005', 'gems',   0),
  ('70000000-0000-4000-8000-000000000006', 'waves',  0),
  ('70000000-0000-4000-8000-000000000007', 'fame',   0),
  ('70000000-0000-4000-8000-000000000008', 'tech',   0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Fleet decks + members
-- ---------------------------------------------------------------------------
insert into public.fleet_decks (id, captainId, name, description, category, isOpen, memberCount, createdAt) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'TechNairobi',    'Devs, founders and makers building in Nairobi.',  'tech',  true, 3, now() - interval '90 days'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'BeatDrop KE',    'Daily drops, live sets and studio vibes.',        'music', true, 3, now() - interval '70 days'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000008', 'Pixels & Pad',   'Clips, speedruns and gamer memes.',               'gaming', true, 2, now() - interval '40 days'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 'The Wave Riders','Short-form kings and queens. 1 minute fame.',     'waves', true, 3, now() - interval '15 days')
on conflict (id) do nothing;

insert into public.fleet_deck_members (deckId, userId, role, joinedAt) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'captain', now() - interval '90 days'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'member',  now() - interval '80 days'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007', 'member',  now() - interval '9 days'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'captain', now() - interval '70 days'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'member',  now() - interval '55 days'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', 'member',  now() - interval '40 days'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000008', 'captain', now() - interval '40 days'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'member',  now() - interval '30 days'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 'captain', now() - interval '15 days'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', 'member',  now() - interval '12 days'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'member',  now() - interval '10 days')
on conflict (deckId, userId) do nothing;

-- ---------------------------------------------------------------------------
-- Fleet posts (fame_heuristics rows are auto-created by trigger in 0006)
-- ---------------------------------------------------------------------------
insert into public.fleet_posts (id, authorId, deckId, parentId, content, mediaUrl, mediaType, checksum, resolution, createdAt, updatedAt) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', null, 'Wrote a script that edits my clips while I sleep. The future is automated. #tech #gems', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/11111111-1111-1111-1111-111111111111/img1.jpg', 'image/jpeg', 'seed-cyber-1', 720, now() - interval '2 hours', now() - interval '2 hours'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', null, 'Night ride through the city. The lights never miss. #waves #tech', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/b3c56a3b-ee0f-495d-9955-24155f62d257/img1_city.jpg', 'image/jpeg', 'seed-neon-1', 1080, now() - interval '5 hours', now() - interval '5 hours'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', null, null, 'POV: your upload hits 10k waves at 3am. #fame #waves', null, null, 'seed-neon-2', null, now() - interval '26 hours', now() - interval '26 hours'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', null, 'Made a beat on my phone at the bus stop. Producers, rate it. #music #humor', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/b52b2665-3a13-4160-9596-38c26036f22b/img3_tech.jpg', 'image/jpeg', 'seed-rumz-1', 720, now() - interval '8 hours', now() - interval '8 hours'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', null, 'They said 1 minute of fame was a gimmick. Tell that to my gem count. #fame #gems', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/a53c5e7f-9e6d-4ed3-a129-c5005686b7e3/img5_abstract.jpg', 'image/jpeg', 'seed-kwame-1', 1080, now() - interval '3 hours', now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000002', null, 'Today on Nyash Chef: 60-second pilau. The whole pot went. #humor #music', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/6ffa4eeb-36d2-4792-ae3a-316dac00c03a/vid1_bunny.mp4', 'video/mp4', 'seed-nyash-1', null, now() - interval '1 hour', now() - interval '1 hour'),
  ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000005', null, '20000000-0000-4000-8000-000000000004', 'Update: the pilau is gone AND someone sent me gems for it. Today is a good day.', null, null, 'seed-nyash-2', null, now() - interval '50 minutes', now() - interval '50 minutes'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000004', null, 'Rain drifting practice. 2 wheels, 0 regrets. #waves #gaming', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/780e0163-6473-408e-bdaa-f3d5b1cad66c/img9_travel.jpg', 'image/jpeg', 'seed-drift-1', 1080, now() - interval '4 hours', now() - interval '4 hours'),
  ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000001', null, 'Just shipped my portfolio site in one weekend. Took me 3 years to finally do it. #tech', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/065de822-faae-4f55-9ca3-1f482efff074/img2_nature.jpg', 'image/jpeg', 'seed-sahara-1', 720, now() - interval '6 hours', now() - interval '6 hours'),
  ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000003', null, 'New speedrun route just dropped. Beat my own record by 0.4s and clipped it for you. #gaming #live', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/dfcede4a-f683-464b-b8f2-8250ba4d9e89/img10_space.jpg', 'image/jpeg', 'seed-pixel-1', 720, now() - interval '7 hours', now() - interval '7 hours'),
  ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', null, null, 'Who else refreshes the fame feed during lunch? Just me? #fame #humor', null, null, 'seed-rumz-2', null, now() - interval '30 hours', now() - interval '30 hours'),
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', null, 'Demo day stream in 30. Tune in, I''m showing the wave prediction model live. #live #tech', null, null, 'seed-cyber-2', null, now() - interval '12 hours', now() - interval '12 hours'),
  ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000006', null, '20000000-0000-4000-8000-000000000008', 'Rain practice = tomorrow is clear track day. Who''s rolling?', null, null, 'seed-drift-2', null, now() - interval '3 hours', now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', null, 'Day 1 of wave marathon: 30 waves in 30 days. Your hugs keep me going. #waves #gems', 'https://bvhywimygpsoctrlrwky.supabase.co/storage/v1/object/public/media/posts/dc224352-5e2a-4d4f-8afb-74aa47f9e93d/vid5_fun.mp4', 'video/mp4', 'seed-kwame-2', null, now() - interval '20 hours', now() - interval '20 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Fame heuristics: the trigger already created 'evaluating' rows; assign statuses.
-- ---------------------------------------------------------------------------
update public.fame_heuristics set
  status = 'fame_burst',
  checksumVerified = true,
  resolutionMeetsFloor = true,
  sentimentScore = 0.9200,
  tagCorrelationScore = 0.8800,
  viewsCount = 48210,
  completionRate = 0.7800,
  latencyOfInterestMs = 1400,
  followConversionRate = 0.1200,
  burstStartedAt = now() - interval '26 hours',
  burstEndedAt = now() - interval '2 hours',
  updatedAt = now()
where postId in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000005',
  '20000000-0000-4000-8000-000000000006',
  '20000000-0000-4000-8000-000000000008',
  '20000000-0000-4000-8000-000000000010',
  '20000000-0000-4000-8000-000000000012'
);

update public.fame_heuristics set
  status = 'trend_deck',
  checksumVerified = true,
  resolutionMeetsFloor = true,
  sentimentScore = 0.7400,
  tagCorrelationScore = 0.7000,
  viewsCount = 18940,
  completionRate = 0.5400,
  latencyOfInterestMs = 3200,
  followConversionRate = 0.0600,
  burstStartedAt = now() - interval '8 hours',
  burstEndedAt = null,
  updatedAt = now()
where postId in (
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000009',
  '20000000-0000-4000-8000-000000000014'
);

update public.fame_heuristics set
  sentimentScore = 0.5100,
  tagCorrelationScore = 0.4000,
  viewsCount = 3100,
  completionRate = 0.2200,
  updatedAt = now()
where postId in (
  '20000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000007',
  '20000000-0000-4000-8000-000000000011',
  '20000000-0000-4000-8000-000000000013'
);

-- ---------------------------------------------------------------------------
-- Post interactions (hug / echo / cast / anchor)
-- ---------------------------------------------------------------------------
insert into public.post_interactions (postId, userId, type, createdAt) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'hug',   now() - interval '2 hours'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'hug',   now() - interval '100 minutes'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007', 'echo',  now() - interval '90 minutes'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'hug',   now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000003', 'cast',  now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000008', 'hug',   now() - interval '2 hours'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004', 'hug',   now() - interval '1 hour'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', 'echo',  now() - interval '1 hour'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000007', 'anchor',now() - interval '55 minutes'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 'hug',   now() - interval '4 hours'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000004', 'hug',   now() - interval '4 hours'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000004', 'echo',  now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000006', 'hug',   now() - interval '7 hours'),
  ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000002', 'cast',  now() - interval '6 hours'),
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000007', 'hug',   now() - interval '12 hours'),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000006', 'hug',   now() - interval '20 hours'),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000001', 'anchor',now() - interval '19 hours'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'hug',   now() - interval '5 hours')
on conflict (postId, userId, type) do nothing;

-- ---------------------------------------------------------------------------
-- Polls + options + votes
-- ---------------------------------------------------------------------------
insert into public.polls (id, postId, question, expiresAt, createdAt) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', 'Is this beat drop-worthy?',        now() + interval '3 days', now() - interval '8 hours'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000010', 'Which route should I run next?',    now() + interval '2 days', now() - interval '7 hours'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Ship the AI editor to beta?',       now() + interval '5 days', now() - interval '2 hours')
on conflict (id) do nothing;

insert into public.poll_options (id, pollId, optionText) values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Drop it'),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 'Keep cooking'),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000002', 'Castle%'),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000002', 'Water temple'),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000003', 'Yes, ship it'),
  ('50000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000003', 'Not yet')
on conflict (id) do nothing;

insert into public.poll_votes (optionId, userId, createdAt) values
  ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', now() - interval '7 hours'),
  ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', now() - interval '6 hours'),
  ('50000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000006', now() - interval '5 hours'),
  ('50000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', now() - interval '6 hours'),
  ('50000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000007', now() - interval '2 hours'),
  ('50000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', now() - interval '1 hour')
on conflict (optionId, userId) do nothing;

-- ---------------------------------------------------------------------------
-- Post tags + tag counts
-- ---------------------------------------------------------------------------
insert into public.post_tags (postId, tagId) values
  ('20000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000008'),
  ('20000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000006', '70000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000009', '70000000-0000-4000-8000-000000000008'),
  ('20000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000008'),
  ('20000000-0000-4000-8000-000000000014', '70000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000014', '70000000-0000-4000-8000-000000000005')
on conflict (postId, tagId) do nothing;

update public.tags set count = (select count(*) from public.post_tags where post_tags.tagId = tags.id);

-- ---------------------------------------------------------------------------
-- Live streams + tickets
-- ---------------------------------------------------------------------------
insert into public.live_streams (id, broadcasterId, title, quality, isLive, playbackUrl, isGated, entryFeeGems, startedAt, createdAt) values
  ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Wave prediction model — live demo', 'aqua_premium', true,  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', false, 0,   now() - interval '20 minutes', now() - interval '1 day'),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'Nyash Chef live: 60-second chapatis', 'drift_expo',    true,  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', true,  50,  now() - interval '5 minutes',  now() - interval '2 days'),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000008', 'Speedrun attempts (don''t clip me)', 'drift_expo',    false, null, true,  20,  null, now() - interval '3 days'),
  ('60000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 'Drift day recap + rain edits',       'drift_expo',    false, null, false, 0,   null, now() - interval '4 days')
on conflict (id) do nothing;

insert into public.stream_tickets (streamId, viewerId, purchasedAt) values
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', now() - interval '4 minutes'),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', now() - interval '3 minutes'),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', now() - interval '3 days')
on conflict (streamId, viewerId) do nothing;

-- ---------------------------------------------------------------------------
-- Wallets + gem transactions
-- ---------------------------------------------------------------------------
insert into public.wallets (userId, balance, updatedAt) values
  ('10000000-0000-4000-8000-000000000001', 1240, now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000002', 320,  now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000003', 180,  now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000004', 980,  now() - interval '3 hours'),
  ('10000000-0000-4000-8000-000000000005', 560,  now() - interval '1 hour'),
  ('10000000-0000-4000-8000-000000000006', 0,    now() - interval '4 days'),
  ('10000000-0000-4000-8000-000000000007', 2500, now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000008', 75,   now() - interval '6 hours')
on conflict (userId) do nothing;

insert into public.gem_transactions (id, senderId, receiverId, amount, type, status, referenceId, createdAt) values
  ('80000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000005', 100, 'tip',           'completed', null, now() - interval '1 hour'),
  ('80000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 50,  'tip',           'completed', null, now() - interval '2 hours'),
  ('80000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', null,                               500, 'deposit',       'completed', 'dep-seed-1', now() - interval '3 days'),
  ('80000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 30,  'tip',           'completed', null, now() - interval '4 hours'),
  ('80000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000005', 50,  'stream_entry',  'completed', 'entry-stream-2', now() - interval '5 minutes'),
  ('80000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 20,  'stream_entry',  'completed', 'entry-stream-3', now() - interval '3 days'),
  ('80000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', null,                               200, 'withdrawal',    'pending',   'payout-seed-1', now() - interval '1 day'),
  ('80000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000008', 25,  'tip',           'completed', null, now() - interval '6 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Payout requests
-- ---------------------------------------------------------------------------
insert into public.payout_requests (id, userId, gemAmount, fiatAmount, fiatCurrency, mobileMoneyNumber, provider, status, createdAt) values
  ('90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 200, 1200.00, 'KES', '+254711000001', 'mpesa', 'pending',   now() - interval '1 day'),
  ('90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000007', 800, 4800.00, 'KES', '+254711000002', 'mpesa', 'completed', now() - interval '8 days')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
insert into public.notifications (id, userId, actorId, type, content, amount, isRead, createdAt) values
  ('a0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000007', 'tip',    'Sahara Siren sent you 100 gems for the pilau video.', 100, false, now() - interval '1 hour'),
  ('a0000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'hug',    'Neon Rider hugged your post.',                            null, false, now() - interval '2 hours'),
  ('a0000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'echo',   'CyberPunk echoed your wave.',                               null, true,  now() - interval '3 hours'),
  ('a0000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000004', 'stream', 'Kwame the Goat joined your drift stream.',                    null, false, now() - interval '4 hours'),
  ('a0000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 'cast',   'Neon Rider cast your speedrun clip.',                        null, false, now() - interval '6 hours')
on conflict (id) do nothing;
