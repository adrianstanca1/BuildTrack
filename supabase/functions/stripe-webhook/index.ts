// BuildTrack Stripe Webhook Handler
// Deploy to Supabase Edge Functions: supabase functions deploy stripe-webhook
// Configure Stripe webhook endpoint to POST to: https://<project>.supabase.co/functions/v1/stripe-webhook
// Set STRIPE_WEBHOOK_SECRET and STRIPE_SECRET_KEY in Supabase Secrets

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?dts";

// Initialize Stripe
const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-04-10" }) : null;

// Initialize Supabase admin client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!stripe || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: `Webhook verification failed: ${message}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency: log event first
  const { data: eventLog } = await supabaseAdmin.rpc("upsert_billing_event", {
    p_stripe_event_id: event.id,
    p_event_type: event.type,
    p_payload: event.data.object as unknown as Record<string, unknown>,
  });

  if (!eventLog) {
    // Duplicate event — already processed
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook handler error:", message);
    // Return 200 to Stripe so it doesn't retry — we logged the event and can replay manually
    return new Response(JSON.stringify({ received: true, error: message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

// ─── Event Handlers ─────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  if (!customerId || !subscriptionId) return;

  // Fetch subscription details from Stripe
  const stripeSub = await stripe!.subscriptions.retrieve(subscriptionId);
  const tier = getTierFromPrice(stripeSub.items.data[0]?.price.id);

  // Find user by stripe_customer_id
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId);

  const userId = profiles?.[0]?.id;
  if (!userId) {
    console.error(`No user found for Stripe customer ${customerId}`);
    return;
  }

  // Upsert subscription
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      tier,
      status: "active",
      current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" }
  );

  // Update profile
  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
    })
    .eq("id", userId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_subscription_id", subscriptionId);

  const sub = subs?.[0];
  if (!sub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", sub.id);

  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("id", sub.user_id);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_subscription_id", subscriptionId);

  const sub = subs?.[0];
  if (!sub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("id", sub.id);

  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("id", sub.user_id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_subscription_id", subscription.id);

  const sub = subs?.[0];
  if (!sub) return;

  const tier = getTierFromPrice(subscription.items.data[0]?.price.id);
  const status = mapStripeStatus(subscription.status);

  await supabaseAdmin
    .from("subscriptions")
    .update({
      tier,
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("id", sub.id);

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: status,
    })
    .eq("id", sub.user_id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id")
    .eq("stripe_subscription_id", subscription.id);

  const sub = subs?.[0];
  if (!sub) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("id", sub.id);

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_status: "inactive",
    })
    .eq("id", sub.user_id);
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getTierFromPrice(priceId?: string): "free" | "pro" | "enterprise" {
  // Map Stripe price IDs to tiers — configure these in your Stripe dashboard
  const priceMap: Record<string, "free" | "pro" | "enterprise"> = {
    // Example placeholders — replace with actual Stripe price IDs
    price_pro_monthly: "pro",
    price_enterprise_monthly: "enterprise",
  };
  return priceMap[priceId || ""] || "free";
}

function mapStripeStatus(status: string): "active" | "inactive" | "past_due" | "cancelled" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "cancelled";
    default:
      return "inactive";
  }
}
