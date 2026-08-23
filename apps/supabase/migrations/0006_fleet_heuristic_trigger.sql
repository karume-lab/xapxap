-- Auto-create fame_heuristics row when a fleet_posts row is inserted
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

CREATE TRIGGER on_fleet_post_created
  AFTER INSERT ON public.fleet_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_fame_heuristic();
