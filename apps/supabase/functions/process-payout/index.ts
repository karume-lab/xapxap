import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { payout_id } = await req.json();

    if (!payout_id) {
      return new Response(
        JSON.stringify({ error: "payout_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: payout, error: fetchError } = await supabase
      .from("payout_requests")
      .select("*")
      .eq("id", payout_id)
      .single();

    if (fetchError || !payout) {
      return new Response(
        JSON.stringify({ error: "Payout not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payout.status !== "pending") {
      return new Response(
        JSON.stringify({ error: `Payout already ${payout.status}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", payout.user_id)
      .single();

    if (walletError || !wallet || wallet.balance < payout.gem_amount) {
      await supabase
        .from("payout_requests")
        .update({ status: "failed" })
        .eq("id", payout_id);

      return new Response(
        JSON.stringify({ error: "Insufficient wallet balance" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deductError } = await supabase
      .from("wallets")
      .update({
        balance: wallet.balance - payout.gem_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", payout.user_id);

    if (deductError) {
      return new Response(
        JSON.stringify({ error: "Failed to deduct balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("gem_transactions").insert({
      sender_id: payout.user_id,
      receiver_id: null,
      amount: payout.gem_amount,
      type: "withdrawal",
      status: "completed",
      reference_id: payout_id,
    });

    const { error: updateError } = await supabase
      .from("payout_requests")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", payout_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update payout status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout_id,
        gem_deducted: payout.gem_amount,
        fiat_amount: payout.fiat_amount,
        currency: payout.fiat_currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
