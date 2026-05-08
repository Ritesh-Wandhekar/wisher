import { createClient } from "@/lib/supabase/server";
import { getTimeOfDayGreeting, nextOccurrenceDate, daysUntil } from "@/lib/utils";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import type { Event } from "@/types";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email?.split("@")[0] ?? "there");

  const [{ count: totalContacts }, { data: events }, { count: wishesGenerated }] =
    await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*, contacts(name)")
        .order("created_at", { ascending: false }),
      supabase.from("wish_history").select("*", { count: "exact", head: true }),
    ]);

  type EventRow = Event & { contacts?: { name: string } | null };
  const allEvents = (events ?? []) as EventRow[];
  const now = new Date();

  const inMonth = allEvents.filter((e) => {
    const occ = nextOccurrenceDate(e.date, e.is_recurring);
    return occ.getMonth() === now.getMonth() && occ.getFullYear() === now.getFullYear();
  }).length;

  const upcoming7 = allEvents.filter((e) => {
    const occ = nextOccurrenceDate(e.date, e.is_recurring);
    const d = daysUntil(occ, now);
    return d >= 0 && d <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {getTimeOfDayGreeting()}, {name} 👋
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Here’s what’s coming up soon.
        </div>
      </div>

      <StatsCards
        totalContacts={totalContacts ?? 0}
        eventsThisMonth={inMonth}
        wishesGenerated={wishesGenerated ?? 0}
        upcoming7Days={upcoming7}
      />

      <UpcomingEvents events={allEvents} />
    </div>
  );
}

