import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContactCard({
  id,
  name,
  relationship,
  eventsCount,
  lastWish,
}: {
  id: string;
  name: string;
  relationship: string;
  eventsCount: number;
  lastWish?: string | null;
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold truncate">{name}</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {relationship}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {eventsCount} event{eventsCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <Link
            href={`/contacts/${id}`}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
          >
            View
          </Link>
        </div>
        {lastWish ? (
          <div className="mt-4 text-sm text-muted-foreground line-clamp-2">
            “{lastWish}”
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">
            No wishes yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

