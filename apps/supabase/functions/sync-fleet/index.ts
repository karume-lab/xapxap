import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = req.method === "POST"
      ? (await req.json()).since ?? null
      : new URL(req.url).searchParams.get("since");

    let query = supabase
      .from("fleet_posts")
      .select("*, profiles!fleet_posts_author_id_fkey(id, username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (since) {
      query = query.gt("created_at", since);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      return new Response(
        JSON.stringify({ error: postsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const postIds = (posts ?? []).map((p) => p.id);

    const { data: fameData } = await supabase
      .from("fame_heuristics")
      .select("*")
      .in("post_id", postIds);

    const { data: pollData } = await supabase
      .from("polls")
      .select("*, poll_options(*, poll_votes(*))")
      .in("post_id", postIds);

    const fameMap = new Map((fameData ?? []).map((f) => [f.post_id, f]));
    const pollMap = new Map((pollData ?? []).map((p) => [p.post_id, p]));

    const enriched = (posts ?? []).map((post) => ({
      ...post,
      fame: fameMap.get(post.id) ?? null,
      poll: pollMap.get(post.id) ?? null,
    }));

    return new Response(
      JSON.stringify({ posts: enriched, count: enriched.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
