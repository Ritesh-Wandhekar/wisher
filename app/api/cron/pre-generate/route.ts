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

  let generated = 0;
  let skipped = 0;

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

  return NextResponse.json({
    ok: true,
    generated,
    skipped,
    total: upcoming.length,
  });
}
