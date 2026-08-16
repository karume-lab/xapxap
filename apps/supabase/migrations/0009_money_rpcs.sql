-- Money + membership mutations moved server-side so balances are validated and
-- updated atomically instead of trusting client-side read-then-write sequences.
-- All functions are SECURITY DEFINER (run as the owner, bypassing RLS) but
-- validate auth.uid(), so they can only ever affect the calling user.

-- Tip a creator gems. Debits the sender, credits the receiver, atomically.
CREATE OR REPLACE FUNCTION public.tip_gems(p_creator_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  WHERE user_id = auth.uid()
  FOR UPDATE;

  sender_balance := COALESCE(sender_balance, 0);
  IF sender_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient gems';
  END IF;

  INSERT INTO public.gem_transactions (sender_id, receiver_id, amount, type, status)
  VALUES (auth.uid(), p_creator_id, p_amount, 'tip', 'completed');

  UPDATE public.wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = auth.uid();

  INSERT INTO public.wallets (user_id, balance, updated_at)
  VALUES (p_creator_id, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.wallets.balance + EXCLUDED.balance,
        updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Enter a (possibly gated) stream. Charges the entry fee from the viewer's
-- wallet and issues a ticket in a single transaction.
CREATE OR REPLACE FUNCTION public.enter_stream(p_stream_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry_fee integer;
  viewer_balance integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT entry_fee_gems INTO entry_fee
  FROM public.live_streams
  WHERE id = p_stream_id;

  IF entry_fee IS NULL THEN
    RAISE EXCEPTION 'stream not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.stream_tickets
    WHERE stream_id = p_stream_id AND viewer_id = auth.uid()
  ) THEN
    IF entry_fee > 0 THEN
      SELECT balance INTO viewer_balance
      FROM public.wallets
      WHERE user_id = auth.uid()
      FOR UPDATE;

      viewer_balance := COALESCE(viewer_balance, 0);
      IF viewer_balance < entry_fee THEN
        RAISE EXCEPTION 'insufficient gems';
      END IF;

      UPDATE public.wallets
      SET balance = balance - entry_fee, updated_at = now()
      WHERE user_id = auth.uid();

      INSERT INTO public.gem_transactions (sender_id, amount, type, status)
      VALUES (auth.uid(), entry_fee, 'stream_entry', 'completed');
    END IF;

    INSERT INTO public.stream_tickets (stream_id, viewer_id)
    VALUES (p_stream_id, auth.uid());
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Request a payout. Validates balance and reserves the gems immediately
-- (records the withdrawal with a reference back to the payout request) so the
-- balance cannot be double spent while the request is pending.
CREATE OR REPLACE FUNCTION public.request_payout(
  p_gem_amount integer,
  p_fiat_currency varchar,
  p_mobile_money_number varchar,
  p_provider varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  WHERE user_id = auth.uid()
  FOR UPDATE;

  wallet_balance := COALESCE(wallet_balance, 0);
  IF wallet_balance < p_gem_amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  INSERT INTO public.payout_requests (
    user_id, gem_amount, fiat_amount, fiat_currency,
    mobile_money_number, provider, status
  )
  VALUES (
    auth.uid(), p_gem_amount, 0,
    COALESCE(NULLIF(p_fiat_currency, ''), 'KES'),
    p_mobile_money_number, p_provider, 'pending'
  )
  RETURNING id INTO payout_id;

  UPDATE public.wallets
  SET balance = balance - p_gem_amount, updated_at = now()
  WHERE user_id = auth.uid();

  INSERT INTO public.gem_transactions (
    sender_id, receiver_id, amount, type, status, reference_id
  )
  VALUES (auth.uid(), NULL, p_gem_amount, 'withdrawal', 'completed', payout_id);

  RETURN jsonb_build_object('success', true, 'payout_id', payout_id);
END;
$$;

-- Join a fleet deck. Idempotent; bumps the denormalized member_count so the
-- deck owner does not need to grant UPDATE on fleet_decks.
CREATE OR REPLACE FUNCTION public.join_fleet_deck(p_deck_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deck_is_open boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT is_open INTO deck_is_open
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
    WHERE deck_id = p_deck_id AND user_id = auth.uid()
  ) THEN
    INSERT INTO public.fleet_deck_members (deck_id, user_id, role)
    VALUES (p_deck_id, auth.uid(), 'member');

    UPDATE public.fleet_decks
    SET member_count = member_count + 1
    WHERE id = p_deck_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
