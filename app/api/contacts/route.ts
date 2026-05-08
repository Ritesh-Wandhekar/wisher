import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    type EventRow = { id: string; contact_id: string };
    type WishRow = { contact_id: string; wish_text: string; created_at: string };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const contactIds = (contacts ?? []).map((c) => c.id);
    const [{ data: events }, { data: wishes }] = await Promise.all([
      contactIds.length
        ? supabase
            .from("events")
            .select("id, contact_id")
            .in("contact_id", contactIds)
        : Promise.resolve({ data: [] as EventRow[] }),
      contactIds.length
        ? supabase
            .from("wish_history")
            .select("contact_id, wish_text, created_at")
            .in("contact_id", contactIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as WishRow[] }),
    ]);

    const eventsCount = new Map<string, number>();
    for (const e of events ?? []) {
      eventsCount.set(e.contact_id, (eventsCount.get(e.contact_id) ?? 0) + 1);
    }

    const lastWish = new Map<string, string>();
    for (const w of wishes ?? []) {
      if (!lastWish.has(w.contact_id)) lastWish.set(w.contact_id, w.wish_text);
    }

    const shaped = (contacts ?? []).map((c) => ({
      ...c,
      events_count: eventsCount.get(c.id) ?? 0,
      last_wish: lastWish.get(c.id) ?? null,
    }));

    return NextResponse.json(shaped, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const name = (body?.name ?? "").toString().trim();
    const relationship = (body?.relationship ?? "").toString().trim();
    const phone = body?.phone ? body.phone.toString().trim() : null;
    const notes = body?.notes ? body.notes.toString().trim() : null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name,
        relationship,
        phone,
        notes,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

