import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const contactId = url.searchParams.get("contactId");

    let q = supabase.from("events").select("*").order("date", { ascending: true });
    if (contactId) q = q.eq("contact_id", contactId);

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? [], { status: 200 });
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
    const contact_id = (body?.contact_id ?? body?.contactId ?? "").toString();
    const type = (body?.type ?? "").toString();
    const title = (body?.title ?? "").toString().trim();
    const date = (body?.date ?? "").toString();
    const is_recurring = body?.is_recurring ?? body?.isRecurring ?? true;

    if (!contact_id) {
      return NextResponse.json({ error: "contact_id is required" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const { data: created, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        contact_id,
        type,
        title,
        date,
        is_recurring: !!is_recurring,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

