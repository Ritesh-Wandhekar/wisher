import { createClient } from "@/lib/supabase/server";
import { getTimeOfDayGreeting, nextOccurrenceDate, daysUntil } from "@/lib/utils";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { TodayBanner } from "@/components/dashboard/TodayBanner";
import { CalendarExportButton } from "@/components/dashboard/CalendarExportButton";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
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

  // Today's events — for the banner
  const todayEvents = allEvents
    .filter((e) => {
      const occ = nextOccurrenceDate(e.date, e.is_recurring);
      return daysUntil(occ, now) === 0;
    })
    .map((e) => ({
      id: e.id,
      contact_id: e.contact_id,
      contactName: e.contacts?.name ?? "Someone",
      eventTitle: e.title,
      type: e.type,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {getTimeOfDayGreeting()}, {name} 👋
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s coming up soon.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <CalendarExportButton hasEvents={allEvents.length > 0} />
        </div>
      </div>


      {/* Today's birthday / anniversary banners */}
      {todayEvents.length > 0 && <TodayBanner events={todayEvents} />}

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
