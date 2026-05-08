import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nextOccurrenceDate } from "@/lib/utils";

type EventRow = {
  id: string;
  title: string;
  type: string;
  date: string;
  is_recurring: boolean;
  contacts: { name: string } | null;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toICSDate(d: Date) {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  );
}

function escapeICS(str: string) {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

function makeUID(eventId: string) {
  return `${eventId}@wisher-app`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: events } = await supabase
      .from("events")
      .select("*, contacts(name)")
      .eq("user_id", user.id);

    const rows = (events ?? []) as EventRow[];
    const now = new Date();

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wisher//AI Wish App//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Wisher Birthdays & Anniversaries",
      "X-WR-TIMEZONE:UTC",
    ];

    for (const e of rows) {
      const contactName = e.contacts?.name ?? "Someone";
      const summary = `${contactName}'s ${e.title}`;
      const occ = nextOccurrenceDate(e.date, e.is_recurring);
      const dtstart = toICSDate(occ);

      // next day for DTEND (all-day events)
      const endDate = new Date(occ);
      endDate.setDate(endDate.getDate() + 1);
      const dtend = toICSDate(endDate);

      // reminder: 1 day before at 8 AM
      const alarmDate = new Date(occ);
      alarmDate.setDate(alarmDate.getDate() - 1);
      alarmDate.setHours(8, 0, 0, 0);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${makeUID(e.id)}`);
      lines.push(`DTSTAMP:${toICSDate(now)}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      lines.push(`DTEND;VALUE=DATE:${dtend}`);
      lines.push(`SUMMARY:${escapeICS(`🎂 ${summary}`)}`);
      lines.push(
        `DESCRIPTION:${escapeICS(`Open Wisher to generate a personalised wish for ${contactName}! https://wisher-psi.vercel.app/generate`)}`
      );

      // Make it recurring every year
      if (e.is_recurring) {
        lines.push("RRULE:FREQ=YEARLY");
      }

      // Alarm: pop-up 1 day before
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P1DT16H"); // 1 day and 16 hours before = 8am the day before
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${escapeICS(`🎂 Tomorrow is ${summary}! Open Wisher to generate a wish.`)}`);
      lines.push("END:VALARM");

      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const icsContent = lines.join("\r\n");

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="wisher-events.ics"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[export-calendar]", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
