-- ---------------------------------------------------------------------------
-- Notifications system: SECURITY DEFINER trigger functions that automatically
-- create notification rows when users interact with each other's content.
--
-- Notification types generated:
--   hug            – someone hugged your wave
--   echo           – someone echoed your wave
--   cast           – someone cast your wave
--   comment        – someone commented / replied on your wave
--   tip            – someone sent you gems
--   stream_join    – someone joined your live stream
--   fleet_join     – someone joined your fleet deck
--   poll_vote      – someone voted on your poll
--
-- Self-notifications are suppressed (actor != recipient).
-- ---------------------------------------------------------------------------

-- 1. Post interactions (hug / echo / cast) — skip anchor (personal action)
CREATE OR REPLACE FUNCTION public.notify_on_post_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  actor_name text;
  notif_content text;
BEGIN
  IF NEW.type = 'anchor' THEN
    RETURN NEW;
  END IF;

  SELECT author_id INTO post_author_id
  FROM public.fleet_posts WHERE id = NEW.post_id;

  IF post_author_id IS NULL OR post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
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

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (post_author_id, NEW.user_id, NEW.type, notif_content);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_post_interaction_notify ON public.post_interactions;
CREATE TRIGGER on_post_interaction_notify
  AFTER INSERT ON public.post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_post_interaction();


-- 2. Comments / replies (fleet_posts insert with parent_id)
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_author_id uuid;
  actor_name text;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT author_id INTO parent_author_id
  FROM public.fleet_posts WHERE id = NEW.parent_id;

  IF parent_author_id IS NULL OR parent_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.author_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (parent_author_id, NEW.author_id, 'comment', actor_name || ' commented on your wave.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_notify ON public.fleet_posts;
CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.fleet_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();


-- 3. Tips (gem_transactions with type = 'tip')
CREATE OR REPLACE FUNCTION public.notify_on_tip()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_name text;
BEGIN
  IF NEW.type != 'tip' OR NEW.receiver_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.sender_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (user_id, actor_id, type, content, amount)
  VALUES (
    NEW.receiver_id,
    NEW.sender_id,
    'tip',
    actor_name || ' sent you ' || NEW.amount || ' gems.',
    NEW.amount
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_tip_notify ON public.gem_transactions;
CREATE TRIGGER on_tip_notify
  AFTER INSERT ON public.gem_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_tip();


-- 4. Stream entries (stream_tickets insert)
CREATE OR REPLACE FUNCTION public.notify_on_stream_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  broadcaster_id_val uuid;
  actor_name text;
BEGIN
  SELECT broadcaster_id INTO broadcaster_id_val
  FROM public.live_streams WHERE id = NEW.stream_id;

  IF broadcaster_id_val IS NULL OR broadcaster_id_val = NEW.viewer_id THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.viewer_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (broadcaster_id_val, NEW.viewer_id, 'stream_join', actor_name || ' joined your stream.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_stream_entry_notify ON public.stream_tickets;
CREATE TRIGGER on_stream_entry_notify
  AFTER INSERT ON public.stream_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_stream_entry();


-- 5. Fleet deck joins (fleet_deck_members insert)
CREATE OR REPLACE FUNCTION public.notify_on_fleet_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  captain_id_val uuid;
  actor_name text;
BEGIN
  SELECT captain_id INTO captain_id_val
  FROM public.fleet_decks WHERE id = NEW.deck_id;

  IF captain_id_val IS NULL OR captain_id_val = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (captain_id_val, NEW.user_id, 'fleet_join', actor_name || ' joined your deck.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_fleet_join_notify ON public.fleet_deck_members;
CREATE TRIGGER on_fleet_join_notify
  AFTER INSERT ON public.fleet_deck_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_fleet_join();


-- 6. Poll votes
CREATE OR REPLACE FUNCTION public.notify_on_poll_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poll_owner_id uuid;
  actor_name text;
BEGIN
  SELECT fp.author_id INTO poll_owner_id
  FROM public.poll_options po
  JOIN public.polls p ON p.id = po.poll_id
  JOIN public.fleet_posts fp ON fp.id = p.post_id
  WHERE po.id = NEW.option_id;

  IF poll_owner_id IS NULL OR poll_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT username INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  actor_name := COALESCE(actor_name, 'Someone');

  INSERT INTO public.notifications (user_id, actor_id, type, content)
  VALUES (poll_owner_id, NEW.user_id, 'poll_vote', actor_name || ' voted on your poll.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_poll_vote_notify ON public.poll_votes;
CREATE TRIGGER on_poll_vote_notify
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_poll_vote();


-- 7. Allow users to mark their own notifications as read
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
