import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EventBadge } from "@/components/events/EventBadge";
import type { Contact, Event, WishHistory } from "@/types";
import { cn } from "@/lib/utils";
import { AddEventDialog } from "@/components/events/AddEventDialog";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!contact) return notFound();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("contact_id", id)
    .order("date", { ascending: true });

  const { data: wishes } = await supabase
    .from("wish_history")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedContact = contact as Contact;
  const typedEvents = (events ?? []) as Event[];
  const typedWishes = (wishes ?? []) as WishHistory[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">
            {typedContact.name}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {typedContact.relationship}
            {typedContact.phone ? ` • ${typedContact.phone}` : ""}
          </div>
          {typedContact.notes ? (
            <div className="mt-3 text-sm text-zinc-700 max-w-2xl">
              {typedContact.notes}
            </div>
          ) : null}
        </div>
        <Link
          href={`/generate?contactId=${typedContact.id}`}
          className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")}
        >
          Generate New Wish
        </Link>
      </div>

      <Card className="rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Events</div>
          <AddEventDialog contactId={typedContact.id} />
        </div>
        <div className="mt-4 grid gap-3">
          {typedEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No events yet.
            </div>
          ) : (
            typedEvents.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border bg-white p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <EventBadge type={e.type} />
                    <span className="text-xs text-muted-foreground">{e.date}</span>
                  </div>
                </div>
                <Link
                  href={`/generate?contactId=${typedContact.id}&eventId=${e.id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
                >
                  Generate
                </Link>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="rounded-2xl shadow-sm p-6">
        <div className="text-lg font-semibold">Wish History</div>
        <div className="mt-4 space-y-3">
          {typedWishes.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No wishes generated yet.
            </div>
          ) : (
            typedWishes.map((w) => (
              <div key={w.id} className="rounded-2xl border bg-white p-4">
                <div className="text-sm text-muted-foreground">
                  {w.tone} • {w.language}
                </div>
                <div className="mt-2 text-sm leading-relaxed">{w.wish_text}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

