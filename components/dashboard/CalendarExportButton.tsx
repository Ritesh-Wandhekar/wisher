"use client";

import { useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CalendarExportButton({ hasEvents }: { hasEvents: boolean }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleExport() {
    if (!hasEvents) {
      toast.error("Add some contacts and events first!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/export-calendar");
      if (!res.ok) throw new Error("Failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wisher-events.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setDone(true);
      toast.success(
        "Calendar file downloaded! Open it to import into Google Calendar, Apple Calendar, or Outlook.",
        { duration: 5000 }
      );
      setTimeout(() => setDone(false), 3000);
    } catch {
      toast.error("Could not export calendar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-2xl gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-400 transition-all"
      onClick={handleExport}
      disabled={loading}
    >
      {done ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <CalendarDays className="h-4 w-4" />
      )}
      {loading ? "Exporting..." : done ? "Downloaded!" : "Sync to Calendar"}
    </Button>
  );
}
