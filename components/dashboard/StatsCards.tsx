import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCards({
  totalContacts,
  eventsThisMonth,
  wishesGenerated,
  upcoming7Days,
}: {
  totalContacts: number;
  eventsThisMonth: number;
  wishesGenerated: number;
  upcoming7Days: number;
}) {
  const items = [
    { label: "Total contacts", value: totalContacts },
    { label: "Events this month", value: eventsThisMonth },
    { label: "Wishes generated", value: wishesGenerated },
    { label: "Upcoming in 7 days", value: upcoming7Days },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {it.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {it.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

