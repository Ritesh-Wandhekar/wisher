import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { generateWishFromClaude } from "@/lib/claude";
import { nextOccurrenceDate, daysUntil } from "@/lib/utils";

// Vercel Cron calls this every day at midnight UTC
// vercel.json: { "crons": [{ "path": "/api/cron/pre-generate", "schedule": "0 0 * * *" }] }

export const maxDuration = 60; // allow up to 60s for this cron

type EventRow = {
  id: string;
  contact_id: string;
  user_id: string;
  type: string;
  title: string;
  date: string;
  is_recurring: boolean;
  contacts: { name: string; relationship: string } | null;
};

export async function GET(req: Request) {
  // Protect with a secret so only Vercel cron can call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set" },
      { status: 500 }
    );
  }

  // Use service role to bypass RLS and access all users' data
  const supabase = createServerClient(supabaseUrl, serviceKey);

  const now = new Date();

  // Fetch all events happening in the next 2 days
  const { data: events } = await supabase
    .from("events")
    .select("*, contacts(name, relationship)");

  const upcoming = ((events ?? []) as EventRow[]).filter((e) => {
    const occ = nextOccurrenceDate(e.date, e.is_recurring);
    const d = daysUntil(occ, now);
    return d >= 0 && d <= 1; // today and tomorrow
  });

  // Today only — for push notifications
  const todayEvents = ((events ?? []) as EventRow[]).filter((e) => {
    const occ = nextOccurrenceDate(e.date, e.is_recurring);
    return daysUntil(occ, now) === 0;
  });

  let generated = 0;
  let skipped = 0;
  let pushed = 0;

  for (const e of upcoming) {
    const contactName = e.contacts?.name ?? "Friend";
    const relationship = e.contacts?.relationship ?? "Friend";

    // Check if we already have a recent wish for this event (don't regenerate if exists)
    const { data: existing } = await supabase
      .from("wish_history")
      .select("id")
      .eq("user_id", e.user_id)
      .eq("event_id", e.id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      continue; // Already pre-generated recently
    }

    // Get previous wishes to avoid repetition
    const { data: prevRows } = await supabase
      .from("wish_history")
      .select("wish_text")
      .eq("user_id", e.user_id)
      .eq("contact_id", e.contact_id)
      .order("created_at", { ascending: false })
      .limit(5);

    const previousWishes = (prevRows ?? []).map((r) => r.wish_text as string);

    const previous = previousWishes.length
      ? previousWishes.map((w) => `- ${w}`).join("\n")
      : "- (none)";

    const prompt = `You are a heartfelt wish writer. Generate a single, unique, personalised wish message.

Details:
- Recipient name: ${contactName}
- Relationship to sender: ${relationship}
- Occasion: ${e.title} (${e.type})
- Tone: Warm
- Language: English

Rules:
- Write ONLY the wish message, nothing else.
- Must NOT be similar to: ${previous}
- Length: 2-4 sentences. Warm and personal.
- Do NOT use placeholder text. Use the actual name.`;

    try {
      const wish = await generateWishFromClaude(prompt);
      if (!wish) continue;

      await supabase.from("wish_history").insert({
        user_id: e.user_id,
        contact_id: e.contact_id,
        event_id: e.id,
        wish_text: wish,
        language: "English",
        tone: "Warm",
      });

      generated++;
    } catch (err) {
      console.error(`[cron] Failed to generate for event ${e.id}:`, err);
    }
  }

  // Send push notifications for TODAY's events
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (vapidPublic && vapidPrivate && vapidSubject && todayEvents.length > 0) {
    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    // Group today's events by user
    const byUser = new Map<string, EventRow[]>();
    for (const e of todayEvents) {
      const list = byUser.get(e.user_id) ?? [];
      list.push(e);
      byUser.set(e.user_id, list);
    }

    for (const [, userEvents] of byUser) {
      const userId = userEvents[0].user_id;

      // Get all push subscriptions for this user
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", userId);

      if (!subs || subs.length === 0) continue;

      // Build notification message
      const names = userEvents.map((e) => e.contacts?.name ?? "Someone");
      const title =
        names.length === 1
          ? `🎂 Today is ${names[0]}'s ${userEvents[0].title}!`
          : `🎂 ${names.length} special occasions today!`;
      const body =
        names.length === 1
          ? `Tap to generate a heartfelt wish for ${names[0]}.`
          : `${names.slice(0, 2).join(", ")} and more. Tap to generate wishes.`;

      const payload = JSON.stringify({
        title,
        body,
        tag: `wisher-birthday-${userId}`,
        url: "/generate",
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          pushed++;
        } catch (err) {
          console.error(`[cron] Push failed for ${sub.endpoint}:`, err);
          // Remove stale/expired subscriptions automatically
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    generated,
    skipped,
    total: upcoming.length,
    pushed,
  });
}
