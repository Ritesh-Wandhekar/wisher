import { WishHistoryList } from "@/components/wishes/WishHistoryList";
import { ScrollText } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
          <ScrollText className="h-7 w-7 text-violet-600" />
          Wish History
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Every wish you&apos;ve ever generated — copy and reuse anytime.
        </div>
      </div>

      <WishHistoryList />
    </div>
  );
}
