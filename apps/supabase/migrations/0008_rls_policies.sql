-- Enable Row Level Security across the public schema and add policies.
-- Reads of public/content tables stay public (anon) to preserve current UX.
-- Writes are scoped to the authenticated user who owns the row (auth.uid()).
-- Money tables (wallets, gem_transactions, payout_requests) only expose the
-- owner's rows for SELECT and have NO client-side write policies — all
-- mutations flow through SECURITY DEFINER RPCs (see 0009).

-- The fame_heuristics row is auto-created by a trigger on fleet_posts insert.
-- Run it as DEFINER so it can write even though clients have no direct INSERT.
CREATE OR REPLACE FUNCTION public.handle_fame_heuristic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fame_heuristics (post_id)
  VALUES (NEW.id)
  ON CONFLICT (post_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.fleet_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_deck_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fame_heuristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Public content tables
-- ---------------------------------------------------------------------------
CREATE POLICY "fleet_posts_select_public" ON public.fleet_posts
  FOR SELECT USING (true);
CREATE POLICY "fleet_posts_insert_own" ON public.fleet_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "fleet_posts_update_own" ON public.fleet_posts
  FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "fleet_posts_delete_own" ON public.fleet_posts
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "fleet_decks_select_public" ON public.fleet_decks
  FOR SELECT USING (true);
CREATE POLICY "fleet_decks_insert_own" ON public.fleet_decks
  FOR INSERT WITH CHECK (captain_id = auth.uid());
CREATE POLICY "fleet_decks_update_captain" ON public.fleet_decks
  FOR UPDATE USING (captain_id = auth.uid());
CREATE POLICY "fleet_decks_delete_captain" ON public.fleet_decks
  FOR DELETE USING (captain_id = auth.uid());

CREATE POLICY "fleet_deck_members_select_public" ON public.fleet_deck_members
  FOR SELECT USING (true);
CREATE POLICY "fleet_deck_members_insert_own" ON public.fleet_deck_members
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "fleet_deck_members_delete_own" ON public.fleet_deck_members
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "polls_select_public" ON public.polls
  FOR SELECT USING (true);
CREATE POLICY "polls_insert_own_post" ON public.polls
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.fleet_posts WHERE id = post_id AND author_id = auth.uid())
  );
CREATE POLICY "polls_update_own_post" ON public.polls
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.fleet_posts WHERE id = post_id AND author_id = auth.uid())
  );
CREATE POLICY "polls_delete_own_post" ON public.polls
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.fleet_posts WHERE id = post_id AND author_id = auth.uid())
  );

CREATE POLICY "poll_options_select_public" ON public.poll_options
  FOR SELECT USING (true);

CREATE POLICY "poll_votes_select_public" ON public.poll_votes
  FOR SELECT USING (true);
CREATE POLICY "poll_votes_insert_own" ON public.poll_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "poll_votes_update_own" ON public.poll_votes
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "poll_votes_delete_own" ON public.poll_votes
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "post_interactions_select_public" ON public.post_interactions
  FOR SELECT USING (true);
CREATE POLICY "post_interactions_insert_own" ON public.post_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "post_interactions_delete_own" ON public.post_interactions
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "fame_heuristics_select_public" ON public.fame_heuristics
  FOR SELECT USING (true);

CREATE POLICY "live_streams_select_public" ON public.live_streams
  FOR SELECT USING (true);
CREATE POLICY "live_streams_insert_own" ON public.live_streams
  FOR INSERT WITH CHECK (broadcaster_id = auth.uid());
CREATE POLICY "live_streams_update_own" ON public.live_streams
  FOR UPDATE USING (broadcaster_id = auth.uid());
CREATE POLICY "live_streams_delete_own" ON public.live_streams
  FOR DELETE USING (broadcaster_id = auth.uid());

CREATE POLICY "stream_tickets_select_public" ON public.stream_tickets
  FOR SELECT USING (true);

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "tags_select_public" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "post_tags_select_public" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Private / money tables — owner read only, no client-side writes.
-- All writes go through SECURITY DEFINER RPCs in 0009_money_rpcs.sql.
-- ---------------------------------------------------------------------------
CREATE POLICY "wallets_select_own" ON public.wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "gem_transactions_select_own" ON public.gem_transactions
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "payout_requests_select_own" ON public.payout_requests
  FOR SELECT USING (user_id = auth.uid());
