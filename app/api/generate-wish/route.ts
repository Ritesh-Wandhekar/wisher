import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWishFromClaude } from "@/lib/claude";
import type { GenerateWishRequest, GenerateWishResponse } from "@/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v.trim() : "";
}

function buildPrompt(input: GenerateWishRequest, previousWishes: string[]) {
  const previous = previousWishes.length
    ? previousWishes.map((w) => `- ${w}`).join("\n")
    : "- (none)";

  return `You are a heartfelt wish writer. Generate a single, unique, personalised wish message.

Details:
- Recipient name: ${input.contactName}
- Relationship to sender: ${input.relationship}
- Occasion: ${input.eventTitle} (${input.eventType})
- Tone: ${input.tone}
- Language: ${input.language}

Rules:
- Write ONLY the wish message, nothing else. No introductions, no explanations.
- The wish must be unique and NOT similar to any of these previous wishes sent to this person:
${previous}
- Length: 2–4 sentences. Warm and personal.
- If language is not English, write entirely in that language.
- For Gen Z tone: use casual internet slang naturally but not excessively.
- For Poetic tone: use metaphors, rhythm, imagery.
- For Formal tone: professional language, suitable for workplace.
- Do NOT use placeholder text like [Name] — use the actual name provided.
- Do NOT start every wish the same way. Vary the opening.
`;
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json().catch(() => null)) as unknown;
    if (!isRecord(raw)) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const body: GenerateWishRequest = {
      contactName: getString(raw, "contactName"),
      contactId: getString(raw, "contactId"),
      eventId: getString(raw, "eventId"),
      eventType: getString(raw, "eventType"),
      eventTitle: getString(raw, "eventTitle"),
      relationship: getString(raw, "relationship"),
      tone: getString(raw, "tone"),
      language: getString(raw, "language"),
      previousWishes: Array.isArray(raw["previousWishes"])
        ? raw["previousWishes"].filter((x): x is string => typeof x === "string")
        : [],
    };

    for (const k of [
      "contactName",
      "contactId",
      "eventId",
      "eventType",
      "eventTitle",
      "relationship",
      "tone",
      "language",
    ] as const) {
      if (!body[k]) {
        return NextResponse.json({ error: `${k} is required` }, { status: 400 });
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: previousRows } = await supabase
      .from("wish_history")
      .select("wish_text")
      .eq("user_id", user.id)
      .eq("contact_id", body.contactId)
      .eq("event_id", body.eventId)
      .order("created_at", { ascending: false })
      .limit(10);

    const previousWishes = (previousRows ?? [])
      .map((r) => (r as { wish_text?: string }).wish_text)
      .filter((x): x is string => typeof x === "string");
    const prompt = buildPrompt(body, previousWishes);

    const wish = await generateWishFromClaude(prompt);
    if (!wish) {
      return NextResponse.json(
        { error: "Could not generate wish" },
        { status: 500 }
      );
    }

    const { error: saveError } = await supabase.from("wish_history").insert({
      user_id: user.id,
      contact_id: body.contactId,
      event_id: body.eventId,
      wish_text: wish,
      language: body.language,
      tone: body.tone,
    });

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    const resp: GenerateWishResponse = { wish, saved: true };
    return NextResponse.json(resp, { status: 200 });
  } catch (err) {
    console.error("[generate-wish] ERROR:", err);
    return NextResponse.json(
      { error: "Could not generate wish. Please try again." },
      { status: 500 }
    );
  }
}

