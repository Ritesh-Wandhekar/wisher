import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EventBadge } from "@/components/events/EventBadge";
import { daysUntil, nextOccurrenceDate } from "@/lib/utils";
import type { Event } from "@/types";
import { cn } from "@/lib/utils";

function whenLabel(d: number) {
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d > 1) return `in ${d} days`;
  return "Passed";
}

export function UpcomingEvents({
  events,
}: {
  events: Array<Event & { contacts?: { name: string } | null }>;
}) {
  const now = new Date();
  const upcoming = events
    .map((e) => {
      const occ = nextOccurrenceDate(e.date, e.is_recurring);
      return { e, occ, d: daysUntil(occ, now) };
    })
    .filter((x) => x.d >= 0 && x.d <= 30)
    .sort((a, b) => a.occ.getTime() - b.occ.getTime());

  if (upcoming.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm p-6">
        <div className="text-lg font-semibold">Upcoming Events</div>
        <div className="mt-2 text-sm text-muted-foreground">
          No upcoming events in the next 30 days.
        </div>
        <div className="mt-4">
          <Link
            href="/contacts"
            className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")}
          >
            Add Contact
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-semibold">Upcoming Events</div>
        <Link
          href="/contacts"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View all
        </Link>
      </div>
      <div className="mt-4 grid gap-3">
        {upcoming.map(({ e, d }) => {
          const name = e.contacts?.name ?? "Someone";
          return (
            <div
              key={e.id}
              className="rounded-2xl border bg-white p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <EventBadge type={e.type} />
                  <span className="text-xs text-muted-foreground">
                    {whenLabel(d)}
                  </span>
                </div>
              </div>
              <Link
                href={`/generate?contactId=${e.contact_id}&eventId=${e.id}`}
                className={cn(buttonVariants({ variant: "default" }), "rounded-2xl")}
              >
                Generate Wish
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

