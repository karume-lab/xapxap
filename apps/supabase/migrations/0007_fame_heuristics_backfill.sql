-- Backfill fame_heuristics for fleet_posts created before the AFTER INSERT
-- trigger (0006) existed. Without a heuristic row, inner joins in the app
-- (useFameBurst / useFamePost) drop those posts entirely.
INSERT INTO public.fame_heuristics (post_id)
SELECT id
FROM public.fleet_posts
ON CONFLICT (post_id) DO NOTHING;
