-- ============================================================================
-- Migration 0013: Rename all public schema columns from snake_case to camelCase
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Drop all RLS policies that reference column names
-- ---------------------------------------------------------------------------

-- fame_heuristics
DROP POLICY IF EXISTS "fame_heuristics_select_public" ON public.fame_heuristics;

-- fleet_deck_members
DROP POLICY IF EXISTS "fleet_deck_members_delete_own" ON public.fleet_deck_members;
DROP POLICY IF EXISTS "fleet_deck_members_insert_own" ON public.fleet_deck_members;
DROP POLICY IF EXISTS "fleet_deck_members_select_public" ON public.fleet_deck_members;

-- fleet_decks
DROP POLICY IF EXISTS "fleet_decks_delete_captain" ON public.fleet_decks;
DROP POLICY IF EXISTS "fleet_decks_insert_own" ON public.fleet_decks;
DROP POLICY IF EXISTS "fleet_decks_select_public" ON public.fleet_decks;
DROP POLICY IF EXISTS "fleet_decks_update_captain" ON public.fleet_decks;

-- fleet_posts
DROP POLICY IF EXISTS "fleet_posts_delete_own" ON public.fleet_posts;
DROP POLICY IF EXISTS "fleet_posts_insert_own" ON public.fleet_posts;
DROP POLICY IF EXISTS "fleet_posts_select_public" ON public.fleet_posts;
DROP POLICY IF EXISTS "fleet_posts_update_own" ON public.fleet_posts;

-- gem_transactions
DROP POLICY IF EXISTS "gem_transactions_select_own" ON public.gem_transactions;

-- live_streams
DROP POLICY IF EXISTS "live_streams_delete_own" ON public.live_streams;
DROP POLICY IF EXISTS "live_streams_insert_own" ON public.live_streams;
DROP POLICY IF EXISTS "live_streams_select_public" ON public.live_streams;
DROP POLICY IF EXISTS "live_streams_update_own" ON public.live_streams;

-- notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

-- payout_requests
DROP POLICY IF EXISTS "payout_requests_select_own" ON public.payout_requests;

-- poll_options
DROP POLICY IF EXISTS "poll_options_select_public" ON public.poll_options;

-- poll_votes
DROP POLICY IF EXISTS "poll_votes_delete_own" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_insert_own" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_select_public" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_update_own" ON public.poll_votes;

-- polls
DROP POLICY IF EXISTS "polls_delete_own_post" ON public.polls;
DROP POLICY IF EXISTS "polls_insert_own_post" ON public.polls;
DROP POLICY IF EXISTS "polls_select_public" ON public.polls;
DROP POLICY IF EXISTS "polls_update_own_post" ON public.polls;

-- post_interactions
DROP POLICY IF EXISTS "post_interactions_delete_own" ON public.post_interactions;
DROP POLICY IF EXISTS "post_interactions_insert_own" ON public.post_interactions;
DROP POLICY IF EXISTS "post_interactions_select_public" ON public.post_interactions;

-- post_tags
DROP POLICY IF EXISTS "post_tags_select_public" ON public.post_tags;

-- profiles
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- stream_tickets
DROP POLICY IF EXISTS "stream_tickets_select_public" ON public.stream_tickets;

-- tags
DROP POLICY IF EXISTS "tags_select_public" ON public.tags;

-- wallets
DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;

-- ---------------------------------------------------------------------------
-- 2. Drop trigger functions that reference column names
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.handle_fame_heuristic() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_comment() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_fleet_join() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_poll_vote() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_post_interaction() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_stream_entry() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_tip() CASCADE;

-- Also drop RPC functions that reference columns
DROP FUNCTION IF EXISTS public.enter_stream(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.join_fleet_deck(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.tip_gems(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.request_payout(integer, varchar, varchar, varchar) CASCADE;

-- ---------------------------------------------------------------------------
-- 3. Rename columns (table by table)
-- ---------------------------------------------------------------------------

-- profiles
ALTER TABLE public.profiles RENAME COLUMN avatar_url TO avatarUrl;
ALTER TABLE public.profiles RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.profiles RENAME COLUMN display_name TO displayName;
ALTER TABLE public.profiles RENAME COLUMN is_premium TO isPremium;
ALTER TABLE public.profiles RENAME COLUMN updated_at TO updatedAt;

-- fleet_decks
ALTER TABLE public.fleet_decks RENAME COLUMN captain_id TO captainId;
ALTER TABLE public.fleet_decks RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.fleet_decks RENAME COLUMN is_open TO isOpen;
ALTER TABLE public.fleet_decks RENAME COLUMN member_count TO memberCount;

-- fleet_deck_members
ALTER TABLE public.fleet_deck_members RENAME COLUMN deck_id TO deckId;
ALTER TABLE public.fleet_deck_members RENAME COLUMN joined_at TO joinedAt;
ALTER TABLE public.fleet_deck_members RENAME COLUMN user_id TO userId;

-- fleet_posts
ALTER TABLE public.fleet_posts RENAME COLUMN author_id TO authorId;
ALTER TABLE public.fleet_posts RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.fleet_posts RENAME COLUMN deck_id TO deckId;
ALTER TABLE public.fleet_posts RENAME COLUMN media_type TO mediaType;
ALTER TABLE public.fleet_posts RENAME COLUMN media_url TO mediaUrl;
ALTER TABLE public.fleet_posts RENAME COLUMN parent_id TO parentId;
ALTER TABLE public.fleet_posts RENAME COLUMN updated_at TO updatedAt;

-- fame_heuristics
ALTER TABLE public.fame_heuristics RENAME COLUMN burst_ended_at TO burstEndedAt;
ALTER TABLE public.fame_heuristics RENAME COLUMN burst_started_at TO burstStartedAt;
ALTER TABLE public.fame_heuristics RENAME COLUMN checksum_verified TO checksumVerified;
ALTER TABLE public.fame_heuristics RENAME COLUMN completion_rate TO completionRate;
ALTER TABLE public.fame_heuristics RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.fame_heuristics RENAME COLUMN follow_conversion_rate TO followConversionRate;
ALTER TABLE public.fame_heuristics RENAME COLUMN latency_of_interest_ms TO latencyOfInterestMs;
ALTER TABLE public.fame_heuristics RENAME COLUMN post_id TO postId;
ALTER TABLE public.fame_heuristics RENAME COLUMN resolution_meets_floor TO resolutionMeetsFloor;
ALTER TABLE public.fame_heuristics RENAME COLUMN sentiment_score TO sentimentScore;
ALTER TABLE public.fame_heuristics RENAME COLUMN tag_correlation_score TO tagCorrelationScore;
ALTER TABLE public.fame_heuristics RENAME COLUMN updated_at TO updatedAt;
ALTER TABLE public.fame_heuristics RENAME COLUMN views_count TO viewsCount;

-- post_interactions
ALTER TABLE public.post_interactions RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.post_interactions RENAME COLUMN post_id TO postId;
ALTER TABLE public.post_interactions RENAME COLUMN user_id TO userId;

-- post_tags
ALTER TABLE public.post_tags RENAME COLUMN post_id TO postId;
ALTER TABLE public.post_tags RENAME COLUMN tag_id TO tagId;

-- polls
ALTER TABLE public.polls RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.polls RENAME COLUMN expires_at TO expiresAt;
ALTER TABLE public.polls RENAME COLUMN post_id TO postId;

-- poll_options
ALTER TABLE public.poll_options RENAME COLUMN option_text TO optionText;
ALTER TABLE public.poll_options RENAME COLUMN poll_id TO pollId;

-- poll_votes
ALTER TABLE public.poll_votes RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.poll_votes RENAME COLUMN option_id TO optionId;
ALTER TABLE public.poll_votes RENAME COLUMN user_id TO userId;

-- notifications
ALTER TABLE public.notifications RENAME COLUMN actor_id TO actorId;
ALTER TABLE public.notifications RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.notifications RENAME COLUMN is_read TO isRead;
ALTER TABLE public.notifications RENAME COLUMN user_id TO userId;

-- live_streams
ALTER TABLE public.live_streams RENAME COLUMN broadcaster_id TO broadcasterId;
ALTER TABLE public.live_streams RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.live_streams RENAME COLUMN ended_at TO endedAt;
ALTER TABLE public.live_streams RENAME COLUMN entry_fee_gems TO entryFeeGems;
ALTER TABLE public.live_streams RENAME COLUMN is_gated TO isGated;
ALTER TABLE public.live_streams RENAME COLUMN is_live TO isLive;
ALTER TABLE public.live_streams RENAME COLUMN playback_url TO playbackUrl;
ALTER TABLE public.live_streams RENAME COLUMN started_at TO startedAt;

-- stream_tickets
ALTER TABLE public.stream_tickets RENAME COLUMN purchased_at TO purchasedAt;
ALTER TABLE public.stream_tickets RENAME COLUMN stream_id TO streamId;
ALTER TABLE public.stream_tickets RENAME COLUMN viewer_id TO viewerId;

-- gem_transactions
ALTER TABLE public.gem_transactions RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.gem_transactions RENAME COLUMN receiver_id TO receiverId;
ALTER TABLE public.gem_transactions RENAME COLUMN reference_id TO referenceId;
ALTER TABLE public.gem_transactions RENAME COLUMN sender_id TO senderId;

-- payout_requests
ALTER TABLE public.payout_requests RENAME COLUMN created_at TO createdAt;
ALTER TABLE public.payout_requests RENAME COLUMN fiat_amount TO fiatAmount;
ALTER TABLE public.payout_requests RENAME COLUMN fiat_currency TO fiatCurrency;
ALTER TABLE public.payout_requests RENAME COLUMN gem_amount TO gemAmount;
ALTER TABLE public.payout_requests RENAME COLUMN mobile_money_number TO mobileMoneyNumber;
ALTER TABLE public.payout_requests RENAME COLUMN processed_at TO processedAt;
ALTER TABLE public.payout_requests RENAME COLUMN user_id TO userId;

-- wallets
ALTER TABLE public.wallets RENAME COLUMN updated_at TO updatedAt;
ALTER TABLE public.wallets RENAME COLUMN user_id TO userId;

-- ---------------------------------------------------------------------------
-- 4. Recreate RLS policies with camelCase column names
-- ---------------------------------------------------------------------------

-- fame_heuristics
CREATE POLICY "fame_heuristics_select_public" ON public.fame_heuristics FOR SELECT USING (true);

-- fleet_deck_members
CREATE POLICY "fleet_deck_members_delete_own" ON public.fleet_deck_members FOR DELETE USING ("userId" = auth.uid());
CREATE POLICY "fleet_deck_members_insert_own" ON public.fleet_deck_members FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "fleet_deck_members_select_public" ON public.fleet_deck_members FOR SELECT USING (true);

-- fleet_decks
CREATE POLICY "fleet_decks_delete_captain" ON public.fleet_decks FOR DELETE USING ("captainId" = auth.uid());
CREATE POLICY "fleet_decks_insert_own" ON public.fleet_decks FOR INSERT WITH CHECK ("captainId" = auth.uid());
CREATE POLICY "fleet_decks_select_public" ON public.fleet_decks FOR SELECT USING (true);
CREATE POLICY "fleet_decks_update_captain" ON public.fleet_decks FOR UPDATE USING ("captainId" = auth.uid());

-- fleet_posts
CREATE POLICY "fleet_posts_delete_own" ON public.fleet_posts FOR DELETE USING ("authorId" = auth.uid());
CREATE POLICY "fleet_posts_insert_own" ON public.fleet_posts FOR INSERT WITH CHECK ("authorId" = auth.uid());
CREATE POLICY "fleet_posts_select_public" ON public.fleet_posts FOR SELECT USING (true);
CREATE POLICY "fleet_posts_update_own" ON public.fleet_posts FOR UPDATE USING ("authorId" = auth.uid());

-- gem_transactions
CREATE POLICY "gem_transactions_select_own" ON public.gem_transactions FOR SELECT USING (("senderId" = auth.uid()) OR ("receiverId" = auth.uid()));

-- live_streams
CREATE POLICY "live_streams_delete_own" ON public.live_streams FOR DELETE USING ("broadcasterId" = auth.uid());
CREATE POLICY "live_streams_insert_own" ON public.live_streams FOR INSERT WITH CHECK ("broadcasterId" = auth.uid());
CREATE POLICY "live_streams_select_public" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "live_streams_update_own" ON public.live_streams FOR UPDATE USING ("broadcasterId" = auth.uid());

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING ("userId" = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING ("userId" = auth.uid());

-- payout_requests
CREATE POLICY "payout_requests_select_own" ON public.payout_requests FOR SELECT USING ("userId" = auth.uid());

-- poll_options
CREATE POLICY "poll_options_select_public" ON public.poll_options FOR SELECT USING (true);

-- poll_votes
CREATE POLICY "poll_votes_delete_own" ON public.poll_votes FOR DELETE USING ("userId" = auth.uid());
CREATE POLICY "poll_votes_insert_own" ON public.poll_votes FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "poll_votes_select_public" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "poll_votes_update_own" ON public.poll_votes FOR UPDATE USING ("userId" = auth.uid());

-- polls
CREATE POLICY "polls_delete_own_post" ON public.polls FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.fleet_posts WHERE (fleet_posts.id = polls."postId") AND (fleet_posts."authorId" = auth.uid())
));
CREATE POLICY "polls_insert_own_post" ON public.polls FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.fleet_posts WHERE (fleet_posts.id = polls."postId") AND (fleet_posts."authorId" = auth.uid())
));
CREATE POLICY "polls_select_public" ON public.polls FOR SELECT USING (true);
CREATE POLICY "polls_update_own_post" ON public.polls FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.fleet_posts WHERE (fleet_posts.id = polls."postId") AND (fleet_posts."authorId" = auth.uid())
));

-- post_interactions
CREATE POLICY "post_interactions_delete_own" ON public.post_interactions FOR DELETE USING ("userId" = auth.uid());
CREATE POLICY "post_interactions_insert_own" ON public.post_interactions FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "post_interactions_select_public" ON public.post_interactions FOR SELECT USING (true);

-- post_tags
CREATE POLICY "post_tags_select_public" ON public.post_tags FOR SELECT USING (true);

-- profiles
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- stream_tickets
CREATE POLICY "stream_tickets_select_public" ON public.stream_tickets FOR SELECT USING (true);

-- tags
CREATE POLICY "tags_select_public" ON public.tags FOR SELECT USING (true);

-- wallets
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT USING ("userId" = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. Recreate trigger functions with camelCase column names
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_fame_heuristic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fame_heuristics ("postId")
  VALUES (NEW.id)
  ON CONFLICT ("postId") DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_fleet_post_created
  AFTER INSERT ON public.fleet_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_fame_heuristic();

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  parent_author_id uuid;
  actor_name text;
BEGIN
  IF NEW."parentId" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT "authorId" INTO parent_author_id
  FROM public.fleet_posts WHERE id = NEW."parentId";

  IF parent_author_id IS NULL OR parent_author_id = NEW."authorId" THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."authorId";
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications ("userId", "actorId", type, content)
  VALUES (parent_author_id, NEW."authorId", 'comment', actor_name || ' commented on your wave.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.fleet_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

CREATE OR REPLACE FUNCTION public.notify_on_fleet_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  captain_id_val uuid;
  actor_name text;
BEGIN
  SELECT "captainId" INTO captain_id_val
  FROM public.fleet_decks WHERE id = NEW."deckId";

  IF captain_id_val IS NULL OR captain_id_val = NEW."userId" THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."userId";
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications ("userId", "actorId", type, content)
  VALUES (captain_id_val, NEW."userId", 'fleet_join', actor_name || ' joined your deck.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_fleet_join_notify
  AFTER INSERT ON public.fleet_deck_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_fleet_join();

CREATE OR REPLACE FUNCTION public.notify_on_poll_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  poll_owner_id uuid;
  actor_name text;
BEGIN
  SELECT fp."authorId" INTO poll_owner_id
  FROM public.poll_options po
  JOIN public.polls p ON p.id = po."pollId"
  JOIN public.fleet_posts fp ON fp.id = p."postId"
  WHERE po.id = NEW."optionId";

  IF poll_owner_id IS NULL OR poll_owner_id = NEW."userId" THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."userId";
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications ("userId", "actorId", type, content)
  VALUES (poll_owner_id, NEW."userId", 'poll_vote', actor_name || ' voted on your poll.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_poll_vote_notify
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_poll_vote();

CREATE OR REPLACE FUNCTION public.notify_on_post_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_author_id uuid;
  actor_name text;
  notif_content text;
BEGIN
  IF NEW.type = 'anchor' THEN
    RETURN NEW;
  END IF;

  SELECT "authorId" INTO post_author_id
  FROM public.fleet_posts WHERE id = NEW."postId";

  IF post_author_id IS NULL OR post_author_id = NEW."userId" THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."userId";
  actor_name := COALESCE(actor_name, 'Someone');

  IF NEW.type = 'hug' THEN
    notif_content := actor_name || ' hugged your wave.';
  ELSIF NEW.type = 'echo' THEN
    notif_content := actor_name || ' echoed your wave.';
  ELSIF NEW.type = 'cast' THEN
    notif_content := actor_name || ' cast your wave.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications ("userId", "actorId", type, content)
  VALUES (post_author_id, NEW."userId", NEW.type, notif_content);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_interaction_notify
  AFTER INSERT ON public.post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_post_interaction();

CREATE OR REPLACE FUNCTION public.notify_on_stream_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  broadcaster_id_val uuid;
  actor_name text;
BEGIN
  SELECT "broadcasterId" INTO broadcaster_id_val
  FROM public.live_streams WHERE id = NEW."streamId";

  IF broadcaster_id_val IS NULL OR broadcaster_id_val = NEW."viewerId" THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."viewerId";
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications ("userId", "actorId", type, content)
  VALUES (broadcaster_id_val, NEW."viewerId", 'stream_join', actor_name || ' joined your stream.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_stream_entry_notify
  AFTER INSERT ON public.stream_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_stream_entry();

CREATE OR REPLACE FUNCTION public.notify_on_tip()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actor_name text;
BEGIN
  IF NEW.type != 'tip' OR NEW."receiverId" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW."senderId";
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications ("userId", "actorId", type, content, amount)
  VALUES (
    NEW."receiverId",
    NEW."senderId",
    'tip',
    actor_name || ' sent you ' || NEW.amount || ' gems.',
    NEW.amount
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_tip_notify
  AFTER INSERT ON public.gem_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_tip();

-- ---------------------------------------------------------------------------
-- 6. Recreate RPC functions with camelCase column names
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enter_stream(p_stream_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  entry_fee integer;
  viewer_balance integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT "entryFeeGems" INTO entry_fee
  FROM public.live_streams
  WHERE id = p_stream_id;

  IF entry_fee IS NULL THEN
    RAISE EXCEPTION 'stream not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.stream_tickets
    WHERE "streamId" = p_stream_id AND "viewerId" = auth.uid()
  ) THEN
    IF entry_fee > 0 THEN
      SELECT balance INTO viewer_balance
      FROM public.wallets
      WHERE "userId" = auth.uid()
      FOR UPDATE;

      viewer_balance := COALESCE(viewer_balance, 0);
      IF viewer_balance < entry_fee THEN
        RAISE EXCEPTION 'insufficient gems';
      END IF;

      UPDATE public.wallets
      SET balance = balance - entry_fee, "updatedAt" = now()
      WHERE "userId" = auth.uid();

      INSERT INTO public.gem_transactions ("senderId", amount, type, status)
      VALUES (auth.uid(), entry_fee, 'stream_entry', 'completed');
    END IF;

    INSERT INTO public.stream_tickets ("streamId", "viewerId")
    VALUES (p_stream_id, auth.uid());
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.join_fleet_deck(p_deck_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deck_is_open boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT "isOpen" INTO deck_is_open
  FROM public.fleet_decks
  WHERE id = p_deck_id;

  IF deck_is_open IS NULL THEN
    RAISE EXCEPTION 'deck not found';
  END IF;
  IF NOT deck_is_open THEN
    RAISE EXCEPTION 'deck is closed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.fleet_deck_members
    WHERE "deckId" = p_deck_id AND "userId" = auth.uid()
  ) THEN
    INSERT INTO public.fleet_deck_members ("deckId", "userId", role)
    VALUES (p_deck_id, auth.uid(), 'member');

    UPDATE public.fleet_decks
    SET "memberCount" = "memberCount" + 1
    WHERE id = p_deck_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.tip_gems(p_creator_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_balance integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  IF p_creator_id IS NULL OR p_creator_id = auth.uid() THEN
    RAISE EXCEPTION 'invalid recipient';
  END IF;

  SELECT balance INTO sender_balance
  FROM public.wallets
  WHERE "userId" = auth.uid()
  FOR UPDATE;

  sender_balance := COALESCE(sender_balance, 0);
  IF sender_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient gems';
  END IF;

  INSERT INTO public.gem_transactions ("senderId", "receiverId", amount, type, status)
  VALUES (auth.uid(), p_creator_id, p_amount, 'tip', 'completed');

  UPDATE public.wallets
  SET balance = balance - p_amount, "updatedAt" = now()
  WHERE "userId" = auth.uid();

  INSERT INTO public.wallets ("userId", balance, "updatedAt")
  VALUES (p_creator_id, p_amount, now())
  ON CONFLICT ("userId") DO UPDATE
    SET balance = public.wallets.balance + EXCLUDED.balance,
        "updatedAt" = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.request_payout(
  p_gem_amount integer,
  p_fiat_currency character varying,
  p_mobile_money_number character varying,
  p_provider character varying
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  wallet_balance integer;
  payout_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_gem_amount IS NULL OR p_gem_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  IF p_mobile_money_number IS NULL OR p_provider IS NULL THEN
    RAISE EXCEPTION 'missing required payout fields';
  END IF;

  SELECT balance INTO wallet_balance
  FROM public.wallets
  WHERE "userId" = auth.uid()
  FOR UPDATE;

  wallet_balance := COALESCE(wallet_balance, 0);
  IF wallet_balance < p_gem_amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  INSERT INTO public.payout_requests (
    "userId", "gemAmount", "fiatAmount", "fiatCurrency",
    "mobileMoneyNumber", provider, status
  )
  VALUES (
    auth.uid(), p_gem_amount, 0,
    COALESCE(NULLIF(p_fiat_currency, ''), 'KES'),
    p_mobile_money_number, p_provider, 'pending'
  )
  RETURNING id INTO payout_id;

  UPDATE public.wallets
  SET balance = balance - p_gem_amount, "updatedAt" = now()
  WHERE "userId" = auth.uid();

  INSERT INTO public.gem_transactions (
    "senderId", "receiverId", amount, type, status, "referenceId"
  )
  VALUES (auth.uid(), NULL, p_gem_amount, 'withdrawal', 'completed', payout_id);

  RETURN jsonb_build_object('success', true, 'payout_id', payout_id);
END;
$$;
